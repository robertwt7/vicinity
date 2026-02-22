import express from 'express';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// --- Types ---
interface User {
  id: string;
  email: string;
  username: string;
  trustScore: number;
}

interface Incident {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  reportedBy: string;
  reportedById: string;
  upvotes: number;
  downvotes: number;
}

interface Comment {
  id: string;
  incidentId: string;
  text: string;
  author: string;
  authorId: string;
  isAnonymous: boolean;
  timestamp: string;
}

// --- Mock Data ---
let users: User[] = [
  { id: 'user_1', email: 'demo@vicinity.app', username: 'Demo User', trustScore: 100 },
  { id: 'user_2', email: 'alex@vicinity.app', username: 'Alex M.', trustScore: 85 },
  { id: 'user_3', email: 'jordan@vicinity.app', username: 'Jordan K.', trustScore: 92 },
  { id: 'user_4', email: 'sam@vicinity.app', username: 'Sam R.', trustScore: 78 },
  { id: 'user_5', email: 'priya@vicinity.app', username: 'Priya T.', trustScore: 115 },
];

let incidents: Incident[] = [
  {
    id: '1',
    categoryId: 'accident',
    title: 'Multi-car collision',
    description: 'Two cars collided at the intersection. Emergency services on the way. Avoid the area.',
    latitude: 40.7549,
    longitude: -73.984,
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    reportedBy: 'Alex M.',
    reportedById: 'user_2',
    upvotes: 24,
    downvotes: 2,
  },
  {
    id: '2',
    categoryId: 'police',
    title: 'Heavy police presence',
    description: 'Multiple NYPD units stationed near Times Square. Large perimeter set up on 42nd.',
    latitude: 40.758,
    longitude: -73.9855,
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    reportedBy: 'Jordan K.',
    reportedById: 'user_3',
    upvotes: 18,
    downvotes: 0,
  },
  {
    id: '3',
    categoryId: 'entertainment',
    title: 'Street guitarist killing it',
    description: 'Amazing musician playing classic rock covers near the park. Drawing a huge crowd!',
    latitude: 40.751,
    longitude: -73.978,
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    reportedBy: 'Sam R.',
    reportedById: 'user_4',
    upvotes: 42,
    downvotes: 1,
  },
  {
    id: '4',
    categoryId: 'event',
    title: 'Pop-up food market',
    description: 'Surprise food market with 20+ vendors. Amazing tacos, ramen, and desserts.',
    latitude: 40.762,
    longitude: -73.992,
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    reportedBy: 'Priya T.',
    reportedById: 'user_5',
    upvotes: 67,
    downvotes: 3,
  },
];

let comments: Comment[] = [
  {
    id: 'c1',
    incidentId: '1',
    text: 'I can see this from my window. Looks like both drivers are okay thankfully.',
    author: 'Nina G.',
    authorId: 'user_6',
    isAnonymous: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
];

// --- Auth Routes ---
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  console.log('[POST /auth/login]', email);
  if (password && password.length >= 4) {
    const user = users.find(u => u.email === email) || users[0];
    res.json({ user, token: 'mock_token_vicinity_abc123' });
  } else {
    res.status(401).json({ message: 'Invalid email or password.' });
  }
});

app.post('/auth/register', (req, res) => {
  const { email, password, username } = req.body;
  console.log('[POST /auth/register]', email);
  const newUser: User = {
    id: `user_${Date.now()}`,
    email,
    username: username || 'New User',
    trustScore: 100,
  };
  users.push(newUser);
  res.json({ user: newUser, token: 'mock_token_vicinity_abc123' });
});

app.get('/auth/me', (req, res) => {
  console.log('[GET /auth/me]');
  res.json(users[0]);
});

app.post('/auth/logout', (req, res) => {
  console.log('[POST /auth/logout]');
  res.status(200).send();
});

// --- User Routes ---
app.get('/users/:id', (req, res) => {
  const { id } = req.params;
  console.log('[GET /users/:id]', id);
  const user = users.find(u => u.id === id);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json(user);
});

app.get('/users/:id/incidents', (req, res) => {
  const { id } = req.params;
  console.log('[GET /users/:id/incidents]', id);
  const userIncidents = incidents.filter(i => i.reportedById === id);
  res.json(userIncidents);
});

// --- Incidents Routes ---
app.get('/incidents', (req, res) => {
  console.log('[GET /incidents] count:', incidents.length);
  res.json(incidents);
});

app.post('/incidents', (req, res) => {
  const { categoryId, description, latitude, longitude } = req.body;
  console.log('[POST /incidents]', categoryId);
  const newIncident: Incident = {
    id: `inc_${Date.now()}`,
    categoryId,
    title: `${categoryId.charAt(0).toUpperCase() + categoryId.slice(1)} reported nearby`,
    description: description.trim() || 'No additional details provided.',
    latitude,
    longitude,
    timestamp: new Date().toISOString(),
    reportedBy: users[0].username,
    reportedById: users[0].id,
    upvotes: 0,
    downvotes: 0,
  };
  incidents = [newIncident, ...incidents];
  res.json(newIncident);
});

app.post('/incidents/:id/upvote', (req, res) => {
  const { id } = req.params;
  console.log('[POST /incidents/:id/upvote]', id);
  const found = incidents.find((i) => i.id === id);
  if (!found) return res.status(404).json({ message: 'Incident not found.' });
  found.upvotes += 1;
  
  // Update trust score of the reporter
  const reporter = users.find(u => u.id === found.reportedById);
  if (reporter) {
    reporter.trustScore += 1;
  }
  
  res.json(found);
});

app.post('/incidents/:id/downvote', (req, res) => {
  const { id } = req.params;
  console.log('[POST /incidents/:id/downvote]', id);
  const found = incidents.find((i) => i.id === id);
  if (!found) return res.status(404).json({ message: 'Incident not found.' });
  found.downvotes += 1;
  
  // Update trust score of the reporter
  const reporter = users.find(u => u.id === found.reportedById);
  if (reporter) {
    reporter.trustScore -= 2; // Downvotes hurt more
  }
  
  res.json(found);
});

app.delete('/incidents/:id', (req, res) => {
  const { id } = req.params;
  console.log('[DELETE /incidents/:id]', id);
  incidents = incidents.filter((i) => i.id !== id);
  res.status(204).send();
});

// --- Comments Routes ---
app.get('/incidents/:id/comments', (req, res) => {
  const { id } = req.params;
  console.log('[GET /incidents/:id/comments]', id);
  const incidentComments = comments
    .filter((c) => c.incidentId === id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  res.json(incidentComments);
});

app.post('/incidents/:id/comments', (req, res) => {
  const { id } = req.params;
  const { text, isAnonymous } = req.body;
  console.log('[POST /incidents/:id/comments]', id, isAnonymous);
  const newComment: Comment = {
    id: `c_${Date.now()}`,
    incidentId: id,
    text: text.trim(),
    author: isAnonymous ? 'Anonymous' : users[0].username,
    authorId: users[0].id,
    isAnonymous,
    timestamp: new Date().toISOString(),
  };
  comments = [newComment, ...comments];
  res.json(newComment);
});

app.listen(port, () => {
  console.log(`Mock server running at http://localhost:${port}`);
});
