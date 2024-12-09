import { useState } from "react";
import Content from "./content";
import Footer from "./footer";
import Header from "./header";

function Container() {
  const [message, setMessage] = useState<string[]>(["Ready !"]);

  const writeToConsole = (consoleMessage: string) => {
    setMessage((prevMessage) => [...prevMessage, consoleMessage]);
  };

  return (
    <>
      <div className="plugin-container">
        <Header />
        <Content message={message} />
        <Footer writeToConsole={writeToConsole} />
      </div>
      <style>
        {`
    .plugin-container {
      background-color: #333;
    `}
      </style>
    </>
  );
}

export default Container;
