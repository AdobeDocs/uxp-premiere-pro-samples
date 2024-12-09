function Content({ message }) {
  return (
    <>
      <div className="plugin-content">
        {message.map((item: string, index: number) => {
          return <div key={index}>{item}</div>;
        })}
      </div>

      <style>{`
    .plugin-content {
      color:#fff;
      background-color: #444;
      width: 100%;
      padding: 8px;
      font-size: 1.2em;
      min-height: 15em;
      border-radius: 5px;
    }
  `}</style>
    </>
  );
}

export default Content;
