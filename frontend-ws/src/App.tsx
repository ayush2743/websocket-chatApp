import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
    const [messages, setMessages] = useState([
        {
            user: false,
            message: "Welcome to the anonymous chat rooms!🎉",
        },
        {
            user: false,
            message: "Select any color room to start chatting.",
        }
    ]);

    const colors = ["rgb(82, 55, 55)", "rgb(54, 66, 90)", "rgb(63, 82, 63)"];
    const [roomId, setRoomId] = useState(0);
    const socketRef = useRef<WebSocket | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const messageEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:8080");
        socketRef.current = ws;



        ws.onopen = () => {
            console.log("Connected to WebSocket server");
        };

        ws.onmessage = (ev) => {
            const message = ev.data;
            setMessages((prev) => [...prev, { user: false, message }]);
        }

        ws.onerror = (err) => {
            console.error("WebSocket error:", err);
        };

        ws.onclose = () => {
            console.log("Disconnected from WebSocket server");
        };

        return () => {
            ws.close();
        };
    }, []);


    useEffect(() => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    };

    const sendMessage = () => {
        if (inputRef.current && socketRef.current) {
            const message = inputRef.current.value.trim();
            if (message) {
                inputRef.current.value = "";
                const sendData = JSON.stringify({ type: "chat", payload: { roomId: roomId, message } });
                socketRef.current.send(sendData);
                setMessages((prev) => [...prev, { user: true, message }]);
            }
        }
    };

    function redRoom() {

        setMessages([{ user: false, message: "🟥 Welcome to the Red room!",}])
        if (socketRef.current) {
            setRoomId(1);
            const sendJoin = JSON.stringify({ type: "join", payload: { roomId: 1 } });
            socketRef.current.send(sendJoin);
        }
    }

    function blueRoom() {

        setMessages([{ user: false, message: "🟦 Welcome to the Blue room!",}])
        if (socketRef.current) {
            setRoomId(2);
            const sendJoin = JSON.stringify({ type: "join", payload: { roomId: 2 } });
            socketRef.current.send(sendJoin);
        }
    }

    function greenRoom() {

        setMessages([{ user: false, message: "🟩 Welcome to the Green room!",}])
        if (socketRef.current) {
            setRoomId(3);
            const sendJoin = JSON.stringify({ type: "join", payload: { roomId: 3 } });
            socketRef.current.send(sendJoin);
        }
    }

    return (
        <div className="App">
            <div className="room-box">
                <button onClick={redRoom} className="redroom"></button>
                <button onClick={blueRoom} className="blueroom"></button>
                <button onClick={greenRoom} className="greenroom"></button>
            </div>
            <div className="main-box" style={{ border: `2px solid ${colors[roomId-1]}` }}>
                <div className="text-box">
                    {messages.map((msg, index) => (

                        <div className={msg.user ? 'message' : 'othermessage'} key={index}>
                            {msg.message}
                        </div>
                    ))}
                    <div ref={messageEndRef} />
                </div>
                <div className="divider" />
                <div className="input-box">
                    <input
                        ref={inputRef}
                        onKeyDown={handleKeyPress}
                        className="input"
                        type="text"
                        placeholder="Type a message..."
                    />
                </div>
            </div>
        </div>
    );
}

export default App;
