'use strict';

var kafka = require('kafka-node'),
    Consumer = kafka.Consumer,
    client = new kafka.Client(),
    consumer = new Consumer(
        client,
        [
            {topic: 'seckill', partition: 0}
        ],
        {
            autoCommit: true
        }
    );

var mysql = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'seckill'
});

connection.connect();

consumer.on('message', function (message) {
    console.log(message);
    connection.query('INSERT INTO seckill set ?', {update_date: new Date()}, function(error, results, fields){
        if(error){
            console.error(error);
        }
        console.log(results);
    })
});