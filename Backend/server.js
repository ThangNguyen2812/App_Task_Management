const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());


app.use(express.json());



app.get('/get', (req, res) => {
  res.send('Server is running');
});

app.listen(PORT, ()=>{
  console.log(`Server is running at the port ${PORT}`);
})