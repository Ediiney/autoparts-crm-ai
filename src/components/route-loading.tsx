export function RouteLoading() {
  return (
    <div className="route-loading-v3" aria-label="Carregando conteúdo">
      <div className="route-loading-v3-title">
        <span />
        <strong />
        <i />
      </div>
      <div className="route-loading-v3-toolbar" />
      <div className="route-loading-v3-content">
        {Array.from({ length: 7 }).map((_, index) => <i key={index} />)}
      </div>
    </div>
  );
}
