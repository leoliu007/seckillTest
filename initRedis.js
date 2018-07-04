var redis = require('redis');

var client = redis.createClient(6379, 'redis');
client.set("counter", "100");

client.get('counter', function(err, doc){
  if(err) console.log('error:', err);
  console.log(doc);
  client.quit();
});