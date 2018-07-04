'use strict';

const Controller = require('egg').Controller;
let count = 0;

class HomeController extends Controller {
  async index() {
    const redis = require('redis');
    const client = redis.createClient({ 'host': '127.0.0.1', 'port': '6379', 'db':'0' });
    const counter = client.get('counter', function(err, reply) {
        console.log(reply);
    });
    console.log(counter);
  }

  async seckill(){
    const redis = require('redis');
    const kafka = require('kafka-node'),
          Producer = kafka.Producer,
          kafkaClient  = new kafka.KafkaClient({kafkaHost: 'localhost:9092'}),
          producer = new Producer(kafkaClient);
    const {ctx} = this;
    console.log('seckill post counts:'+ count++);
    let result = "Hello";
    const fn = function(optClient) {
        let client = optClient;
        if (optClient == null || optClient == 'undefined'){
            client = redis.createClient({ 'host': '127.0.0.1', 'port': '6379', 'db':'0' });
        }
        client.on('error',function (err) {
            console.log("Error:" + err.stack);
            client.end(true);
        });
        client.watch('counter');
        client.get('counter',function(err,reply) {
            console.log("geting counter:" + reply);
            if (parseInt(reply) > 0){
                const multi = client.multi();
                multi.decr('counter');
                multi.exec(function (err,replies) {
                    if (replies == null){
                        console.log('it has been updated by someone else');
                        fn(client);
                    }else{
                        console.log(replies);
                        let payload = [{
                            topic: 'seckill',
                            messages: ['buy a phone'],
                            partition: 0
                        }];
                        producer.send(payload, function(err,data){
                            console.log(data);
                        });
                        producer.on('error', function (err) {
                          console.log(err);
                        })
                        client.end(true);
                    }
                })
            }else{
                console.log('sold out');
                client.end(true);
            }
        });
    };
    fn();
    ctx.response.body = result;
  }
}

module.exports = HomeController;
