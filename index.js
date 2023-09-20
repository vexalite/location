const express = require('express');
const bodyParser = require('body-parser');
const Redis = require('ioredis');

const app = express();
const port = process.env.PORT || 3000;

const redisClient = new Redis({
    host: 'redis-10113.c301.ap-south-1-1.ec2.cloud.redislabs.com',
    port: 10113,
    password: 'JwDHHRmHg3UYIjpNftcr8jjm2tXcMelc',
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

app.use(bodyParser.json());

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Create a Redis stream for a user
app.post('/api/user/stream', async (req, res) => {
    try {
      const { userId } = req.params;
      const { streamName } = req.body;
  
      await redisClient.xgroup('CREATE', streamName, 'myGroup', '$', 'MKSTREAM');

     
      res.status(201).json({ message: 'Stream created successfully' });
    } catch (error) {
      console.error('Error creating user stream:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
// Add data to a user's stream
app.post('/api/user/:streamName', async (req, res) => {
    try {
      const { userId, streamName } = req.params;
      const latestCoordinates  = req.body;

    // console.log(latestCoordinates)
    await redisClient.xadd(streamName, '*','data', JSON.stringify(req.body));
    // const { req.body } = latestCoordinates
    //   medianCoordinates.forEach((medianCoord, index) => {
    //     const distance = geolib.getDistance(latestCoordinates, medianCoord);
    //     if (distance <= 200) {
    //         console.log(`Alert`)
    //     }
    // });
      res.status(201).json({ message: 'Data added to the stream' });
    } catch (error) {
      console.error('Error adding data to user stream:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
// Query data from a user's stream
app.get('/api/user/:streamName', async (req, res) => {
    try {
      const { userId, streamName } = req.params;
      
      const streamData = await redisClient.xrange(streamName, '-', '+');
      
      const extractedData = streamData.map(([messageId, message]) => message)
        
        // const data = JSON.parse(message.data)

      //   return {
      //     message
      //   };
      // });
      res.status(200).json(extractedData);
    } catch (error) {
      console.error('Error fetching data from user stream:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
