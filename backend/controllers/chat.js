const express=require('express');
const pool=require('../db.js');
// fetch all chats(side bar)
export const fetch_chats = async (req, res) => {
    let { id } = req.user;

    if (!id) {
        return res.status(403).json({
            message: "the user is not authorized to access this page",
            status: false
        });
    }

    try {

        let personal = await pool.query(`
            select
                d.chat_type,
                d.otheruser,
                d.chat_id,
                d.name,
                e.message,
                e.timestamp
            from
            (
                (
                    (
                        (
                            select
                                c.chat_type,
                                p.chat_id,
                                p.user_id
                            from participants p
                            join chat c
                                on c.chat_id = p.chat_id
                            where p.user_id = $1
                              and c.chat_type = 'private'
                        ) a
                        join
                        (
                            select
                                p.chat_id as cid,
                                p.user_id as otheruser
                            from participants p
                            join chat c
                                on p.chat_id = c.chat_id
                            where p.user_id <> $1
                              and c.chat_type = 'private'
                        ) b
                        on a.chat_id = b.cid
                    ) c
                    join users u
                        on c.otheruser = u.user_id
                ) d
                left join
                (
                    select distinct on (chat_id)
                        chat_id,
                        message,
                        timestamp
                    from message
                    order by chat_id, timestamp desc
                ) e
                on d.cid = e.chat_id
            )
        `, [id]);

        let group = await pool.query(`
            select
                a.chat_type,
                a.chat_id,
                a.name,
                b.message,
                b.timestamp
            from
            (
                select
                    c.chat_id,
                    c.chat_type,
                    c.name
                from chat c
                join participants p
                    on c.chat_id = p.chat_id
                where p.user_id = $1
                  and c.chat_type = 'public'
            ) a
            left join
            (
                select distinct on (chat_id)
                    chat_id,
                    message,
                    timestamp
                from message
                order by chat_id, timestamp desc
            ) b
            on a.chat_id = b.chat_id
        `, [id]);

        let final = [...personal.rows, ...group.rows];

        final.sort(
            (a, b) =>
                new Date(b.timestamp || 0) -
                new Date(a.timestamp || 0)
        );

        return res.status(200).json({
            message: "chat retrieved successfully",
            status: true,
            chat: final
        });

    } catch (err) {
        return res.status(500).json({
            message: `there was an error ${err.message}`,
            status: false
        });
    }
};

// search for group and users
export const search=async(req,res)=>{
    let{string}=req.params;
    if(string.length==0){
        return res.status(400).json({message:"invalid search",status:false});
    }
    try{
        let result=await pool.query('select name,user_idfrom users where name ~* $1 or user_name ~* $1',[string]);
        let result2=await pool.query('select name,chat_id from chat where name ~* $1',[string]);
        let final=[...result.rows,...result2.rows];
        return res.status(200).json({message:"users found",status:true,users:final});
    }catch(err){
        return res.status(500).json({message:` there was an error ${err.message}`,status:false});
    }
}
export const create_group=async(req,res)=>{
    let {user}=req.body;
    if(user.length>4){
        return res.status(400).json({message:"user limit is 4",status:false});
    }
    if(user.length<2){
        return res.status(400).json({message:"add more users",status:false});
    }
    try{
        let result=await pool.query('insert into chat (chat_type) values ($1) returning chat_id',['public']);
        let chatid=result.rows[0].chat_id
        for(const c of user){
            await pool.query('insert into participants (chat_id,user_id) values ($1,$2)',[chatid,c]);
        }
        return res.status(200).json({message:'group created',status:true,groupid:chatid});
    }catch(err){
        return res.status(500).json({message:`${err.message}`,status:false});
    }

}



export const fetch_messages=async(req,res)=>{
    let{id}=req.user;
    try{
        let result=await pool.query('select message,user_id,timestamp,chat_id from message where chat_id=$1',[id]);
        return res.status(200).json({message:'the messages were fetched sucesfully',status:true,message:result.rows});
    }catch(err){
        return res.status(500).json({message:`${err.message}`,status:false});
    }
}
// fetch group chats
/* select a.id as chat_id ,a.name,b.message,b.time from (
  (select c.id,c.name from chat c join participants p on c.id=p.chat_id where p.userid=$1 and c.chat_type='public')a 
  join
  (select distinct on(sent_in) sent_in,message,time from message order by sent_in,time desc)b
  on a.id=b.sent_in
) */

// fetch individual chats
/* select d.otheruser,d.chat_id,d.name,e.message,e.time from (
(((select p.chat_id,p.userid from participants p 
  join chat c on c.id=p.chat_id where p.userid=10 and c.chat_type='private')a
  join (select p.chat_id as cid,p.userid as otheruser from participants p join chat c on p.chat_id=c.id where p.userid<>10 and c.chat_type='private')b
  on a.chat_id=b.cid)c 
  join users u on c.otheruser=u.userid
  )d
  left join 
  (select distinct on (sent_in) sent_in,message,time from message order by sent_in,time desc)e
  on d.cid=e.sent_in
) */


// load chat
// fetch messages
// home screen loading 
