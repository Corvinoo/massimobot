const { Client, Intents, ClientUser, RichPresenceAssets, User, Guild, MessageAttachment, Message, PartialTextBasedChannel, MessageSelectMenu, NewsChannel } = require('discord.js');
const {AudioPlayer, createAudioResource, StreamType, entersState, VoiceConnectionStatus, joinVoiceChannel, createAudioPlayer} = require("@discordjs/voice");
require('dotenv').config();

const client = new Client({ partials: ["CHANNEL"], intents: [
    Intents.FLAGS.GUILD_VOICE_STATES, 
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILDS,
    'GUILDS',
    Intents.FLAGS.DIRECT_MESSAGES] });
const gTTS = require('gtts');
const { join } = require('path');
const GoogleImages = require('google-images');
const { time } = require('console');
let ENGINE_ID = process.env.ENGINE_ID;
if(ENGINE_ID == undefined) ENGINE_ID = ' '; 
let IMAGE_KEY = process.env.IMAGE_KEY
if(IMAGE_KEY == undefined) IMAGE_KEY = ' ';
const images = new GoogleImages(ENGINE_ID, IMAGE_KEY);
const ytdl = require('ytdl-core')
let isTtsOn = new Map()



client.on('ready', () =>{
    client.user?.setStatus('online') 
    const Guilds = client.guilds.cache.map(guild => guild);
    // @ts-ignore
    // client.channels.cache.get('907107307282894878')?.send('Auguri miei cadetti')
    for(let guild of Guilds){
        isTtsOn.set(guild, true)
         
    }
    console.log('[Bot is ready]')
})



let joinCommand = 'tras'
let exitCommand = 'iesc'
let pingCommand = 'ping'
let avatar = 'avatar'

let resource

var today = new Date();
var timeNow = today.getMilliseconds;




let suoniYoutube = [
    {
        'triggers': ['aha', 'hah'], // Triggeratori di eventi
        'mode': 'substring', // substring || fullstring
        'yt_link': 'https://www.youtube.com/watch?v=iYVO5bUFww0&ab_channel=HollywoodLaughTracks', 
    },
    {
        'triggers': ['vai massimo'], // Triggeratori di eventi
        'mode': 'substring', // substring || fullstring
        'yt_link': 'https://www.youtube.com/watch?v=9t3qXXJSaKk&ab_channel=Codex', 
    },


]

/**
 * Test the triggers and eventually play a sound
 */
function test_sounds(msg_content_raw) {

    const msg = msg_content_raw.content;

    suoniYoutube.forEach(suoni => {
        
        if (suoni.mode == 'substring') {

            if (suoni.triggers.some(trigger => msg.includes(trigger) ) ) {

                // * Found substring

                streamYT(suoni.yt_link);
                return;

            }

        } else {

            if (suoni.triggers.includes(msg) ) {
    
                // * Found fullstring

                streamYT(suoni.yt_link);
                return;

            }

        }

        

    });

}



client.on('messageCreate', async (msg) =>{
    if(!msg.author.bot){
        let connection
        switch(msg.content){
            case joinCommand : 
            try{
                connectToVoiceChannel(msg, connection)
            }
            catch(e){}
            break
            case exitCommand : disconnect(connection)
            break
            case pingCommand : 
            msg.channel.send('pinging').then(m => {
                m.edit(`${m.createdTimestamp - msg.createdTimestamp} ms`);
              });
            break
            // @ts-ignore
            case avatar : 
            // @ts-ignore
            msg.reply(msg.author.avatarURL())
        }

        if(msg.content.includes('tts on')){
            msg.channel.send('mo parlo')
            isTtsOn.set(msg.guild, true)

        }
        if(msg.content.includes('tts off')){
            msg.channel.send('mo non parlo')
            isTtsOn.set(msg.guild, false)
        }
        
        if(isTtsOn.get(msg.guild)){

            if ( test_sounds(msg) ) {
                console.log('Played sound')
            } else {
                tts(msg)
            }
        }
        
        googleImages(msg)
        if(msg.channel.type == 'DM'){
            if(msg.author.id == '490563800005869588'){
                // @ts-ignore
                client.channels.cache.get('907386567910367262')?.send(msg.content)
            }
            else{
                ttsString(msg.content)
            }
            console.log(
                msg.author.username + 
                ": " +
                msg.content
            )
        }
    }
})


function streamYT(url){
    const stream = ytdl(url, {
        filter: 'audioonly'
    });
    const resource = createAudioResource(stream, {
        inputType: StreamType.Arbitrary
    });
    try{
        player.play(resource)
    }
    catch(e){
        console.log(e)
    }
}

client.on('voiceStateUpdate', (voice) =>{
    if(!voice.member?.user.bot){

        if(voice.member?.voice.channelId === null){
            console.log(voice.member?.user.username + ' left');
            ttsString("finalmente se n'è andato " + voice.member.user.username)
        }
        else{
            if(!(voice.member?.voice.selfMute 
                || voice.member?.voice.selfDeaf 
                || voice.member?.voice.selfVideo 
                || voice.member?.voice.streaming)){
                console.log(voice.member?.user.username + ' joined');
                ttsString(voice.member?.user.username + ' tutto apposto, come stai?')
            }
        }
    }
})



const player = createAudioPlayer()

function connectToVoiceChannel(msg, connection){
    console.log('[Trying to connect]')

    setTimeout(async function(){
        if(connection === undefined || null){
            console.error('[Connection timed out]')
        }
    }, 5000)

    var channel = msg.member?.voice.channelId; 
    var guild = msg.guildId; 
    // @ts-ignore
    var adapter = msg.guild.voiceAdapterCreator; 

    


    // console.log(`${channel} - ${guild} - ${adapter}`) 
    if (channel == null || undefined) { return; } 
    if (guild == null || undefined) { return; } 
    if (adapter == null || undefined) { return; } 

    
    if(connection === undefined){
        try{ 
            connection = joinVoiceChannel({ 
                channelId : channel, 
                guildId : guild, 
                // @ts-ignore 
                adapterCreator: adapter 
            }).subscribe(player)

            console.log('[Connected]')
        }
        catch(e){
            console.log(e)   
            console.log('[Error while connecting]')
        }
    }
    
}



function disconnect(connection){
    if(connection != null){
        connection?.disconnect()
        console.log('[Disconnected]')
    }
}


/**
 * @param {String} nameFile
 */
function playAudio(nameFile){
    resource = createAudioResource(join(__dirname, nameFile + '.mp3'), { inlineVolume: true });
    try{
        player.play(resource);
    }
    catch(e){
        console.log(e)
    }
}

var newTalkingUser = new Map()
var txt = ' '
function tts(msg){

    txt = msg.content
    
    fixMentions(msg)
    
    checkIfNewUserSpeaking(msg)

    var speech =  msg.content.split(" ").slice(1).join(" ")
    if(txt.includes('http://'||'https://')){
        console.log('url sent by ' + msg.author.username + ' : ' + txt)
        txt = msg.author.username + ' ha inviato una link'
    }
    if(txt.includes('https://vm.tiktok.com/')){
        txt = 'roberto, anna ha inviato un nuovo tiktok'
    }
    var gtts
    try{
        gtts = new gTTS(txt, 'it')
    }
    catch(e){
        gtts = new gTTS('ma che cazzo hai inviato', 'it')
    }
    
    //to support multiple guilds independently you have to change the file name
    //using the guild's id to differentiate the names and a map for the resource
    //with the guild's id as the key
    gtts.save('file.mp3', function (err, result){
        if(err) { throw new Error(err); }
        resource = createAudioResource(join(__dirname, 'file.mp3'), { inlineVolume: true });
        try{
            player.play(resource);
        }
        catch(e){
            console.log(e)
        }
    });
    
}

function ttsString(str){
    var gtts
    try{
        gtts = new gTTS(str, 'it')
    }
    catch(e){
        gtts = new gTTS('ma che cazzo hai inviato', 'it')
    }
    
    gtts.save('file.mp3', function (err, result){
        if(err) { throw new Error(err); }
        playAudio('file')
        if(resource?.ended){
            player.removeListener
        }
    });
    
}

async function googleImages(message){
    if(message.content.includes("it's " && " time")) 
        try { 
            var query = message.content.split(" ") 
            const results = await images.search(query[1]); 
            if(results.length >= 1){
                message.channel.send(results[0].url) 
                message.channel.send('qualcuno mi ha chiamato?'); 
                setTimeout(function(){  
                    // client.user?.setAvatar(results[0].url) 
                }, 80000); 
            }
            else{
                message.reply('con tutto il rispetto ma che cazzo devo cercare')
            }
        } 
        catch (e) { 
            console.error(e); 
            message.channel.send("pe piacere lo stato non mi paga ||https://www.shorturl.at/lsAP5||"); 
        } 
}

function checkIfNewUserSpeaking(msg){
    if(newTalkingUser.get(msg.guildId) != msg.author){
        newTalkingUser.set(msg.guildId, msg.author)
        txt = `${newTalkingUser.get(msg.guildId).username} ha detto ${txt}`
    } 
}

function fixMentions(msg){
    if(msg.mentions.members?.first != null){
        let mention = msg.mentions.members.first()?.user.username
        // @ts-ignore
        txt = msg.content.replace(msg.mentions.members.first(), mention)
    }
}

setInterval(async function() {
    try{
        ttsString('ricordatevi di bere')
    }
    catch(e){

    }
  }, 2000000);



client.login()
    