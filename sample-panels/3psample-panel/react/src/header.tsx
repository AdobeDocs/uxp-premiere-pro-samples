function Header() {
  return (
    <>
      <div className="plugin-header">Scripting Plugin</div>

      <style>{`
    .plugin-header {
      color:#ccc;
      background-color: #333;
      width: 100%;
      padding: 5px;
      font-size: 1.6em;
      padding-bottom: 8px;
    }
  `}</style>
    </>
  );
}

export default Header;
