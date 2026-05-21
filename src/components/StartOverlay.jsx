export default function StartOverlay({ onStart }) {
  return (
    <div className="start-overlay">
      <section className="overlay-card start-panel">
        <p className="eyebrow">Phase 1 · Stage Setup</p>
        <h1 className="headline">VR Dance Term Project</h1>
        <p className="subcopy">
          這一版先把舞台、燈光、鏡頭與角色插槽搭起來，並先對齊
          Character Creator 的角色流程，讓你可以先捏外觀、再把角色接進場景。
        </p>
        <ul className="bullet-list">
          <li>已預留主舞者與搭檔兩個角色插槽。</li>
          <li>目前用佔位模型代表未匯入角色的位置與體型。</li>
          <li>鏡頭改成手動控制優先，停下後會維持當前角度與縮放。</li>
        </ul>
        <button className="primary-button" onClick={onStart}>
          Enter Stage
        </button>
      </section>
    </div>
  );
}
