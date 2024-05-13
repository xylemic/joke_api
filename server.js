

const http = require('http');
const { title } = require('process');
const url = require('url');

// In-memory database
let db = [
  { id: 1, title: 'Why did the chicken cross the road?', comedian: 'Daniel Johnson', year: 2020 },
  { id: 2, title: 'Why was the math book sad?', comedian: 'Jane Smith', year: 2022 },
  { id: 3, title: 'Why do deers cross the roads blindly?', comedian: 'Barry Allen', year: 2024 }
];

const server = http.createServer((req, res) => {
  let body = '';

  req.on('data', chunk => {
    body += chunk.toString();
  });

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  if (method === 'GET' && pathname === '/') {
    // GET /
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(db));
  } else if (method === 'POST' && pathname === '/') {
    // POST /
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const newJoke = JSON.parse(body);
      newJoke.id = db.length + 1;
      db.push(newJoke);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(db));
    });
  } else if (method === 'PATCH' && pathname.startsWith('/joke/')) {
    // PATCH /joke/:id
    const jokeId = parseInt(parsedUrl.pathname.split('/')[3]);
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const updatedJokeData = JSON.parse(body);
      const jokeToUpdate = db.find(joke => joke.id === jokeId);

      if (jokeToUpdate) {
        const updatedJoke = { ...jokeToUpdate, ...updatedJokeData };
        db = db.map(joke => (joke.id === jokeId ? updatedJoke : joke));
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(updatedJoke));
      } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Joke not found' }));
      }
    });
  } else if (method === 'DELETE' && pathname.startsWith('/joke/')) {
    // DELETE /joke/:id
    const jokeId = parseInt(parsedUrl.pathname.split('/')[3]);
    const jokeToDelete = db.find(joke => joke.id === jokeId);

    if (jokeToDelete) {
      db = db.filter(joke => joke.id !== jokeId);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(jokeToDelete));
    } else {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Joke not found' }));
    }
  } else {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Not found');
  }
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
