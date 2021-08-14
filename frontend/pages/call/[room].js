import React, { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import { socket } from "../../functions/MessageManager";
import { useRouter } from 'next/router'
import styles from '../../styles/Call.module.css'


const Video = (props) => {
    const ref = useRef();

    useEffect(() => {
        props.peer.on("stream", stream => {
            ref.current.srcObject = stream;
            console.log(stream)
        })
    }, []);

    return (
        <video playsInline autoPlay ref={ref} className={styles.video} />
    );
}
var videoConstraints = {};




const Room = (props) => {
    const router = useRouter()
    const { room } = router.query
    const [peers, setPeers] = useState([]);
    var userVideo = useRef();
    const peersRef = useRef([]);

    useEffect(() => {
      console.log(room)
      videoConstraints = {
        height: window.innerHeight / 2,
        width: window.innerWidth / 2
        };
    }, [])

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true }).then(stream => {
            
            userVideo.current.srcObject = stream;
            console.log(stream)
            socket.emit("join room", room);
            socket.on("all users", users => {
                const peers = [];
                users.forEach(userID => {
                    const peer = createPeer(userID, socket.id, stream);
                    peersRef.current.push({
                        peerID: userID,
                        peer,
                    })
                    peers.push(peer);
                })
                setPeers(peers);
            })

            socket.on("user joined", payload => {
                const peer = addPeer(payload.signal, payload.callerID, stream);
                peersRef.current.push({
                    peerID: payload.callerID,
                    peer,
                })

                setPeers(users => [...users, peer]);
            });

            socket.on("receiving returned signal", payload => {
                const item = peersRef.current.find(p => p.peerID === payload.id);
                item.peer.signal(payload.signal);
            });
        })
    }, []);

    function createPeer(userToSignal, callerID, stream) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on("signal", signal => {
            socket.emit("sending signal", { userToSignal, callerID, signal })
        })

        return peer;
    }

    function addPeer(incomingSignal, callerID, stream) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        })

        peer.on("signal", signal => {
            socket.emit("returning signal", { signal, callerID })
        })

        peer.signal(incomingSignal);

        return peer;
    }

    return (
        <div className={styles.videogrid}>
            <video muted ref={userVideo} autoPlay playsInline className={styles.video} />
            {peers.map((peer, index) => {
                return (
                    <Video key={index} peer={peer} />
                );
            })}
        </div>
    );
};

export default Room;