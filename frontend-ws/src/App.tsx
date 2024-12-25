import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
    interface Message {
        user: boolean;
        message: string;
        roomId: number;
    }

    const [messages, setMessages] = useState<Message[]>(() => {
        const savedMessages = localStorage.getItem("messages");
        return savedMessages ? JSON.parse(savedMessages) : [
            {
                user: false,
                message: "Welcome to the anonymous chat rooms!🎉",
                roomId: 0
            },
            {
                user: false,
                message: "Select any color room to start chatting.",
                roomId: 0
            }
        ];
    });

    const [roomId, setRoomId] = useState<number>(() => {
        const savedRoomId = localStorage.getItem("roomId");
        return savedRoomId ? parseInt(savedRoomId) : 0;
    });

    const colors = ["rgb(82, 55, 55)", "rgb(54, 66, 90)", "rgb(63, 82, 63)"];
    const socketRef = useRef<WebSocket | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const messageEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const ws = new WebSocket("wss://websocket-chatapp-skfs.onrender.com");
        socketRef.current = ws;

        ws.onopen = () => {
            console.log("Connected to WebSocket server");

            if (roomId > 0) {
                const sendJoin = JSON.stringify({ type: "join", payload: { roomId } });
                socketRef.current?.send(sendJoin);
            }
        };

        ws.onmessage = (ev) => {
            const message = ev.data;
            setMessages((prev) => [...prev, { user: false, message, roomId }]);
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
    }, [roomId]);

    useEffect(() => {

        localStorage.setItem("messages", JSON.stringify(messages));
        localStorage.setItem("roomId", roomId.toString());

        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, roomId]);

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
                const sendData = JSON.stringify({ type: "chat", payload: { roomId, message } });
                socketRef.current.send(sendData);
                setMessages((prev) => [...prev, { user: true, message, roomId }]);
            }
        }
    };

    function switchRoom(newRoomId: number, roomMessage: string) {
        setRoomId(newRoomId);
        setMessages([{ user: false, message: roomMessage, roomId: newRoomId }]);

        if (socketRef.current) {
            const sendJoin = JSON.stringify({ type: "join", payload: { roomId: newRoomId } });
            socketRef.current.send(sendJoin);
        }
    }

    return (
        <div className="App">
            <div className="room-box">
                <button onClick={() => switchRoom(1, "🟥 Welcome to the Red room!")} className="redroom"></button>
                <button onClick={() => switchRoom(2, "🟦 Welcome to the Blue room!")} className="blueroom"></button>
                <button onClick={() => switchRoom(3, "🟩 Welcome to the Green room!")} className="greenroom"></button>
            </div>
            <div className="main-box" style={{ border: `2px solid ${colors[roomId - 1] || "gray"}` }}>
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
