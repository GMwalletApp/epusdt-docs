<template>
  <div class="sponsor-page">
    <div class="sponsor-hero">
      <span class="sponsor-eyebrow">Support the project</span>
      <h1>Help keep Epusdt growing</h1>
      <p>
        If Epusdt helps your project, you can support ongoing development and maintenance with a crypto donation.
        Every contribution helps improve documentation, product polish, and future features.
      </p>
    </div>

    <div class="sponsor-warning">
      <strong>Important:</strong> Please confirm the network before transferring. Sending funds on the wrong chain may result in permanent loss.
    </div>

    <div class="sponsor-grid">
      <section class="sponsor-card">
        <div class="sponsor-card__head">
          <div>
            <div class="sponsor-card__label">TRON</div>
            <h2>TRC-20 Address</h2>
          </div>
          <span class="sponsor-chip sponsor-chip--tron">TRC-20</span>
        </div>

        <div class="sponsor-qr-frame">
          <img src="/sponsor/tron-trc20.png" alt="TRON TRC-20 donation QR code" />
        </div>

        <div class="sponsor-address-block">
          <span class="sponsor-address-label">Wallet address</span>
          <code>TUsn5Nhi2P12dQ2ecrocUX6e6Jsi6EE8TY</code>
        </div>
      </section>

      <section class="sponsor-card sponsor-card--wide">
        <div class="sponsor-card__head">
          <div>
            <div class="sponsor-card__label">EVM Networks</div>
            <h2>Shared Multi-Chain Address</h2>
          </div>
          <div class="sponsor-chip-group">
            <span class="sponsor-chip">BSC</span>
            <span class="sponsor-chip">ETH</span>
            <span class="sponsor-chip">Polygon</span>
          </div>
        </div>

        <div class="sponsor-qr-frame">
          <img src="/sponsor/evm-multichain.png" alt="EVM shared donation QR code" />
        </div>

        <div class="sponsor-address-block">
          <span class="sponsor-address-label">Wallet address</span>
          <code>0x6c63989c22e89e6f76105f399243ef6b417b205b</code>
        </div>

        <p class="sponsor-card__hint">
          This address can receive assets on BSC, Ethereum, and Polygon. If you are unsure, test with a small amount first.
        </p>
      </section>
    </div>
  </div>
</template>
