const cardStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  width: "200px",
};

export default function Dashboard() {
  return (
    <>
      <h1 style={{ marginBottom: "20px" }}>Visão Geral</h1>

      <div style={{ display: "flex", gap: "20px" }}>
        <div style={cardStyle}>
          <h3>Total de Produtos</h3>
          <p>--</p>
        </div>

        <div style={cardStyle}>
          <h3>Total de Vendas</h3>
          <p>--</p>
        </div>

        <div style={cardStyle}>
          <h3>Vendedoras</h3>
          <p>--</p>
        </div>
      </div>
    </>
  );
}
