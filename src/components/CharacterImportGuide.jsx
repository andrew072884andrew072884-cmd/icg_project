export default function CharacterImportGuide({
  importReadyCount,
  totalSlots,
}) {
  return (
    <aside className="overlay-card guide-panel">
      <h2 className="guide-title">Character Pipeline</h2>
      <p className="guide-text">
        目前已先對齊 Character Creator 流程：你可以先在 CC 捏角色，再直接放
        `FBX` 進來測站位；等材質與骨架確認後，再轉成 `GLB` 做最後的網頁版。
      </p>
      <ul className="guide-list">
        <li>Character Creator 測試格式：`FBX`。</li>
        <li>網頁最終建議格式：`GLB`。</li>
        <li>資產位置：`public/assets/characters/`。</li>
        <li>設定入口：`src/config/characterSlots.js`。</li>
      </ul>
      <p className="guide-footnote">
        Ready slots: {importReadyCount} / {totalSlots}
      </p>
    </aside>
  );
}
