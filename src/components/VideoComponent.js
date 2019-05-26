import React, { Component } from 'react';
import Video from 'twilio-video';

class VideoComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            identity: '',
            token: '',
            previewTracks: null, 
            roomName: '', 
            activeRoom: null,
            localMediaAvailable: true, 
          }
        this.localMedia = React.createRef();
        this.remoteMedia = React.createRef();  
    }

    handleRoomNameChange = event => {
        this.setState({ roomName: event.target.value});
    }

    // Attach User's (TEMP) Video/Audio Tracks to the DOM. 
    attachUserTracks = (tracks, container) => {
        console.log('User Tracks added : ', tracks);
        tracks.forEach(function(track){
            container.appendChild(track.attach());
        });
    }

    // Attach Video/Audio Tracks to the DOM. 
    attachTracks = (tracks, container) => {
        // does nothing right now 
    }

    // Attach the Participant's Tracks to the DOM. 
    attachParticipantTracks = (participant, container) => {
       
       // does nothing right now  
    }
    


    joinRoom = () => {

        const connectOptions = {
            name: this.state.roomName, 
            // logLevel: 'debug'
        };

        if(this.state.previewTracks){
            connectOptions.tracks = this.state.previewTracks; 
        }

        /**
         * Join the Room with the token from the server and 
         * the LocalParticipant's Tracks (User's Video and Audio).
         */
        Video.connect(this.state.token, connectOptions).then( room =>{
            this.roomJoined(room);
        }, error =>{
            console.log('Could not connect to Twilio: '+ error.message);
        });
    };





    roomJoined = room => {
        this.setState({activeRoom: room});

        console.log("Joined as '"+ this.state.identity +"'");
        //change join room button to leave room button here 

        // Attach localParticipant's Tracks, if not already attached. 
        let localVideoContainer = this.localMedia.current;
        if(!localVideoContainer.querySelector('video')){
            this.attachParticipantTracks(room.localParticipant, localVideoContainer);
        }

        // Attach the Tracks of the Room's Participants(Already in room when User joined). 
        room.participants.forEach(participant => {
            participant.tracks.forEach(publication => {
                if(publication.isSubscribed){
                    const track = publication.track; 
                    let remoteMediaContainer = this.remoteMedia.current; 
                    remoteMediaContainer.appendChild(track.attach());
                }

            });
            participant.on('trackSubscribed', track => {
                let remoteMediaContainer = this.remoteMedia.current; 
                remoteMediaContainer.appendChild(track.attach());
            });
            console.log("PARTICIPANT: ", participant);
            console.log("Already in Room: '"+ participant.identity+"'");
            // let remoteVideosContainer = this.remoteMedia.current; 
            // this.attachParticipantTracks(participant, remoteVideosContainer);
        });


        // When a Participant joins the Room, log the event. 
        room.on('participantConnected', participant => {
            console.log("Joining: '" + participant.identity + "'");

            participant.tracks.forEach(publication => {
                if(publication.isSubscribed){
                    const track = publication.track; 
                    let remoteMediaContainer = this.remoteMedia.current; 
                    remoteMediaContainer.appendChild(track.attach());
                }

            });

            participant.on('trackSubscribed', track => {
                let remoteMediaContainer = this.remoteMedia.current; 
                remoteMediaContainer.appendChild(track.attach());
            });
        });

        // When a Participant adds a Track, attach it to the DOM. 
        // This event does not get triggered for some reason. 
        // room.on('trackAdded', (track, participant) => {
        //     console.log('track added by participant');
        //     console.log(participant.identity + " added track: "+ track.king);
        //     let remoteVideosContainer = this.remoteMedia.current; 
            
        //     // this.attachTracks([track], remoteVideosContainer);
        // })
        

        /**
         * Participants leaving events pending. ... 
         */


    }


    previewLocalVideo = () => {
        let localTracksPromise = this.state.previewTracks ? Promise.resolve(this.state.previewTracks) : Video.createLocalTracks(); 
        
        localTracksPromise.then(tracks => {
            this.setState({previewTracks: tracks});
            let previewContainer = this.localMedia.current; 
            if(!previewContainer.querySelector('video')){
                this.attachUserTracks(tracks, previewContainer);
            }
        }, function(error){
            console.log('Unable to access local media', error);
        });
    };

    componentDidMount(){
        this.previewLocalVideo(); 
        if(this.props.name.length)
        fetch(`/api/token?name=${encodeURIComponent(this.props.name)}`)
            .then(response => response.json())
            .then(state => this.setState(state));
    }

    render() { 
        let showLocalVideo = this.state.localMediaAvailable ? (
        <div ref={this.localMedia}></div> ) : null;
        
        let showRemoteVideo = <div ref={this.remoteMedia}><h2>Remove Media</h2></div>

        return (
            <div>
                <input type="text" onChange={this.handleRoomNameChange} value={this.roomName} placeholder="Enter Room Name" />
                <button onClick={this.joinRoom}>Join Room</button>
                {showLocalVideo}
                {showRemoteVideo}
            </div>
          );
    }
}
 
export default VideoComponent;