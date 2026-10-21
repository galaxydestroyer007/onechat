const pool = require('./db');

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*'
    }
});

io.on('connection', (socket) => {

    console.log('the user has joined!');

    socket.on('send-message', async (data) => {

        try {

            let result = await pool.query(
                `insert into message
                (chat_id,user_id,message)
                values($1,$2,$3)
                returning message,chat_id,user_id,timestamp`,
                [data.chat_id, data.user_id, data.message]
            );

            io.to(`${data.chat_id}`)
                .emit('receive-message', result.rows[0]);

        } catch (err) {

            console.log(`there was an error ${err.message}`);

        }

    });

    socket.on('join-room', async (data) => {

        let { id1 } = data;
        let { roomid } = data;
        let { type } = data;

        let chat;

        try {

            if (type === 'public') {

                chat = roomid;

            } else {

                let result = await pool.query(
                    `
                    select c.chat_id
                    from chat c
                    join (
                        select p.chat_id
                        from participants p
                        where p.user_id in ($1,$2)
                        group by p.chat_id
                        having count(distinct p.user_id)=2
                    ) b
                    on c.chat_id=b.chat_id
                    where c.chat_type=$3
                    `,
                    [id1, roomid, type]
                );

                if (result.rows.length === 0) {

                    let created = await pool.query(
                        `
                        insert into chat (chat_type)
                        values ($1)
                        returning chat_id
                        `,
                        [type]
                    );

                    let chatId = created.rows[0].chat_id;

                    await pool.query(
                        `
                        insert into participants (chat_id,user_id)
                        values ($1,$2),($1,$3)
                        `,
                        [chatId, id1, roomid]
                    );

                    chat = chatId;

                } else {

                    chat = result.rows[0].chat_id;

                }
            }

            socket.join(`${chat}`);

            socket.emit('room-joined', {
                room_id: chat
            });

        } catch (err) {

            console.log(`there was an error ${err.message}`);

        }

    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

});

server.listen(3000, () => {
    console.log('server running on port 3000');
});

module.exports = io;