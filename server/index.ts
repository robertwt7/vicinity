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
  upvotes: number;
}

interface Comment {
  id: string;
  incidentId: string;
  text: string;
  author: string;
  isAnonymous: boolean;
  timestamp: string;
}

// --- Mock Data ---
let users: User[] = [
  { id: 'user_1', email: 'demo@vicinity.app', username: 'Demo User' }
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
    upvotes: 24,
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
    upvotes: 18,
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
    upvotes: 42,
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
    upvotes: 67,
  },
  {
    id: '5',
    categoryId: 'fire',
    title: 'Smoke from building',
    description: 'Heavy smoke visible from 4th floor windows. Three fire trucks have arrived on scene.',
    latitude: 40.749,
    longitude: -73.985,
    timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    reportedBy: 'Mike L.',
    upvotes: 31,
  },
  {
    id: '6',
    categoryId: 'fight',
    title: 'Altercation outside bar',
    description: "Argument turned physical outside a bar. Bouncers and police called.",
    latitude: 40.756,
    longitude: -73.976,
    timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    reportedBy: 'Chris W.',
    upvotes: 11,
  },
  {
    id: '7',
    categoryId: 'hazard',
    title: 'Large sinkhole opening',
    description: 'Massive sinkhole opened on 42nd St. Road is completely blocked. Use alternate routes.',
    latitude: 40.764,
    longitude: -73.98,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    reportedBy: 'Dana H.',
    upvotes: 55,
  },
  {
    id: '8',
    categoryId: 'roadblock',
    title: 'Film shoot blocking street',
    description: 'Movie production crew blocking 5th Ave between 50th and 52nd. Detour in place.',
    latitude: 40.753,
    longitude: -73.99,
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    reportedBy: 'Taylor B.',
    upvotes: 28,
  },
];

let comments: Comment[] = [
  {
    id: 'c1',
    incidentId: '1',
    text: 'I can see this from my window. Looks like both drivers are okay thankfully.',
    author: 'Nina G.',
    isAnonymous: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    id: 'c2',
    incidentId: '1',
    text: 'Ambulance just arrived on scene. Traffic is backed up all the way to 6th Ave.',
    author: 'Anonymous',
    isAnonymous: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
  {
    id: 'c3',
    incidentId: '2',
    text: 'Looks like they set up a perimeter. Something big going on.',
    author: 'Marcus D.',
    isAnonymous: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
  },
  {
    id: 'c4',
    incidentId: '3',
    text: 'This guy is incredible! Playing Hendrix covers. Been here for 30 mins.',
    author: 'Anonymous',
    isAnonymous: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    id: 'c5',
    incidentId: '3',
    text: 'Just tipped him $20. Worth every penny. The crowd is growing fast!',
    author: 'Lena K.',
    isAnonymous: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  },
  {
    id: 'c6',
    incidentId: '4',
    text: 'The ramen stall is absolutely insane. Get there before they sell out.',
    author: 'James P.',
    isAnonymous: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
  },
  {
    id: 'c7',
    incidentId: '5',
    text: 'Stay away from the area. The smoke is getting thicker.',
    author: 'Anonymous',
    isAnonymous: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
  },
  {
    id: 'c8',
    incidentId: '1',
    text: 'Tow trucks are here now. Should clear up in about 20 minutes.',
    author: 'Raj S.',
    isAnonymous: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
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
    reportedBy: 'You',
    upvotes: 0,
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
    author: isAnonymous ? 'Anonymous' : 'You',
    isAnonymous,
    timestamp: new Date().toISOString(),
  };
  comments = [newComment, ...comments];
  res.json(newComment);
});

app.listen(port, () => {
  console.log(`Mock server running at http://localhost:${port}`);
});
