export default function CrmLoading() {
  return (
    <div className="route-loading-v2" aria-label="Carregando página">
      <div className="route-loading-v2-head">
        <span />
        <strong />
        <i />
      </div>
      <div className="route-loading-v2-metrics">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index}>
            <span />
            <strong />
            <i />
          </div>
        ))}
      </div>
      <div className="route-loading-v2-panel">
        <span />
        {Array.from({ length: 6 }).map((_, index) => (
          <i key={index} />
        ))}
      </div>
    </div>
  );
}
