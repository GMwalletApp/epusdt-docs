<template>
  <div class="sponsor-page">
    <div class="sponsor-hero">
      <span class="sponsor-eyebrow">支持專案</span>
      <h1>一起讓 Epusdt 做得更好</h1>
      <p>
        如果 Epusdt 對你的項目有幫助，歡迎透過加密貨幣贊助，支持後續開發、文件維護與產品持續打磨。
      </p>
    </div>

    <div class="sponsor-warning">
      <strong>請注意：</strong> 轉帳前請再次確認網路。若發送到錯誤鏈路，資產可能無法找回。
    </div>

    <div class="sponsor-grid">
      <section class="sponsor-card">
        <div class="sponsor-card__head">
          <div>
            <div class="sponsor-card__label">TRON</div>
            <h2>TRC-20 地址</h2>
          </div>
          <span class="sponsor-chip sponsor-chip--tron">TRC-20</span>
        </div>

        <div class="sponsor-qr-frame">
          <img src="/sponsor/tron-trc20.png" alt="TRON TRC-20 贊助二維碼" />
        </div>

        <div class="sponsor-address-block">
          <span class="sponsor-address-label">錢包地址</span>
          <code>TUsn5Nhi2P12dQ2ecrocUX6e6Jsi6EE8TY</code>
        </div>
      </section>

      <section class="sponsor-card sponsor-card--wide">
        <div class="sponsor-card__head">
          <div>
            <div class="sponsor-card__label">EVM Networks</div>
            <h2>多鏈共用地址</h2>
          </div>
          <div class="sponsor-chip-group">
            <span class="sponsor-chip">BSC</span>
            <span class="sponsor-chip">ETH</span>
            <span class="sponsor-chip">Polygon</span>
          </div>
        </div>

        <div class="sponsor-qr-frame">
          <img src="/sponsor/evm-multichain.png" alt="EVM 共用贊助二維碼" />
        </div>

        <div class="sponsor-address-block">
          <span class="sponsor-address-label">錢包地址</span>
          <code>0x6c63989c22e89e6f76105f399243ef6b417b205b</code>
        </div>

        <p class="sponsor-card__hint">
          這個地址可同時接收 BSC、Ethereum、Polygon 上的資產。若不確定，建議先小額測試再正式轉帳。
        </p>
      </section>
    </div>
  </div>
</template>
