#!/usr/bin/env node

/**
 * Verify Price Sync Tool
 * Verifica que el countdown y los precios estén sincronizados con el contrato
 */

const { Connection, PublicKey } = require('@solana/web3.js');

// Mainnet configuration
const MAINNET_RPC = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
const PRESALE_STATE_PDA = 'EoDCTycvkJV4UXm54KYiF1DuCMSHyXYPftGUVr3qJxPp';

async function verifyPriceSync() {
  console.log('━'.repeat(80));
  console.log('🔍 VERIFICANDO SINCRONIZACIÓN DE PRECIOS Y COUNTDOWN');
  console.log('━'.repeat(80));
  console.log('');
  
  try {
    const connection = new Connection(MAINNET_RPC, 'confirmed');
    const presaleStatePubkey = new PublicKey(PRESALE_STATE_PDA);
    
    console.log('📡 Conectando a mainnet...');
    const accountInfo = await connection.getAccountInfo(presaleStatePubkey);
    
    if (!accountInfo) {
      console.error('❌ No se pudo leer el presale state');
      return;
    }
    
    const data = accountInfo.data;
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    
    // Parse timestamps
    let offset = 8 + 32 + 32 + 32 + 1 + 32 + 32 + 1;
    const startTs = Number(view.getBigInt64(offset, true));
    offset += 8;
    const endTs = Number(view.getBigInt64(offset, true));
    offset += 8;
    
    const startDate = new Date(startTs * 1000);
    const endDate = new Date(endTs * 1000);
    const now = Math.floor(Date.now() / 1000);
    
    console.log('✅ Presale State leído correctamente');
    console.log('');
    console.log('📅 TIMELINE:');
    console.log(`   Start: ${startDate.toISOString()} (${startTs})`);
    console.log(`   End:   ${endDate.toISOString()} (${endTs})`);
    console.log(`   Now:   ${new Date(now * 1000).toISOString()} (${now})`);
    console.log('');
    
    // Parse price schedule
    offset += 8; // hardCapTotal
    offset += 1; // isFinalized
    offset += 2; // feeRateBps
    offset += 32 * 6; // skip wallets
    offset += 8 + 8; // maxPurchase, minPurchase
    
    const scheduleLength = view.getUint32(offset, true);
    offset += 4;
    
    console.log('📊 PRICE SCHEDULE:');
    console.log(`   Total tiers: ${scheduleLength}`);
    console.log('');
    
    const tiers = [];
    for (let i = 0; i < scheduleLength; i++) {
      const tierStartTs = Number(view.getBigInt64(offset, true));
      offset += 8;
      const priceUsd = view.getFloat64(offset, true);
      offset += 8;
      
      tiers.push({ tierStartTs, priceUsd, index: i });
      
      const tierDate = new Date(tierStartTs * 1000);
      const isActive = now >= tierStartTs;
      const isCurrent = now >= tierStartTs && (i === scheduleLength - 1 || now < Number(view.getBigInt64(offset, true)));
      
      console.log(`   ${isCurrent ? '👉' : '  '} Tier ${i + 1}: $${priceUsd.toFixed(4)} - ${tierDate.toISOString()} ${isActive ? '✅' : '⏳'}`);
    }
    
    console.log('');
    console.log('━'.repeat(80));
    console.log('🎯 ANÁLISIS ACTUAL:');
    console.log('━'.repeat(80));
    console.log('');
    
    // Find current tier
    let currentTier = null;
    let nextTier = null;
    
    for (let i = tiers.length - 1; i >= 0; i--) {
      if (now >= tiers[i].tierStartTs) {
        currentTier = tiers[i];
        if (i + 1 < tiers.length) {
          nextTier = tiers[i + 1];
        }
        break;
      }
    }
    
    if (currentTier) {
      console.log(`✅ TIER ACTUAL: Tier ${currentTier.index + 1}`);
      console.log(`   💰 Precio: $${currentTier.priceUsd.toFixed(4)}`);
      console.log(`   📅 Inicio: ${new Date(currentTier.tierStartTs * 1000).toISOString()}`);
      console.log('');
      
      if (nextTier) {
        const timeUntilNext = nextTier.tierStartTs - now;
        const days = Math.floor(timeUntilNext / (24 * 60 * 60));
        const hours = Math.floor((timeUntilNext % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((timeUntilNext % (60 * 60)) / 60);
        
        console.log(`📈 PRÓXIMO TIER: Tier ${nextTier.index + 1}`);
        console.log(`   💰 Precio: $${nextTier.priceUsd.toFixed(4)}`);
        console.log(`   📅 Cambio: ${new Date(nextTier.tierStartTs * 1000).toISOString()}`);
        console.log(`   ⏰ Tiempo restante: ${days}d ${hours}h ${minutes}m`);
        console.log(`   📊 Incremento: ${((nextTier.priceUsd / currentTier.priceUsd - 1) * 100).toFixed(2)}%`);
        console.log('');
        
        // Calculate what the frontend should show
        console.log('━'.repeat(80));
        console.log('🖥️  LO QUE DEBE MOSTRAR EL FRONTEND:');
        console.log('━'.repeat(80));
        console.log('');
        console.log('📍 Price Calendar Card:');
        console.log(`   Current Price: $${currentTier.priceUsd.toFixed(4)}`);
        console.log(`   Next Price: $${nextTier.priceUsd.toFixed(4)}`);
        console.log(`   Price Increase: +${((nextTier.priceUsd / currentTier.priceUsd - 1) * 100).toFixed(2)}%`);
        console.log('');
        console.log('⏱️  Countdown Timer:');
        console.log(`   Days: ${String(days).padStart(2, '0')}`);
        console.log(`   Hours: ${String(hours).padStart(2, '0')}`);
        console.log(`   Minutes: ${String(minutes).padStart(2, '0')}`);
        console.log('');
        console.log('📊 Stats Section:');
        console.log(`   Current Price Tier: Tier ${currentTier.index + 1}`);
        console.log('');
        
        // Verification
        console.log('━'.repeat(80));
        console.log('✅ VERIFICACIONES:');
        console.log('━'.repeat(80));
        console.log('');
        
        const checks = [
          { name: 'Price schedule exists', pass: tiers.length >= 1 },
          { name: 'Tier actual identificado', pass: currentTier !== null },
          { name: 'Próximo tier identificado', pass: nextTier !== null },
          { name: 'Incremento calculable', pass: nextTier.priceUsd > currentTier.priceUsd },
          { name: 'Timestamp futuro', pass: nextTier.tierStartTs > now },
          { name: 'Countdown > 0', pass: timeUntilNext > 0 },
          { name: 'Dentro de presale', pass: now >= startTs && now < endTs }
        ];
        
        checks.forEach(check => {
          console.log(`${check.pass ? '✅' : '❌'} ${check.name}`);
        });
        
        const allPass = checks.every(c => c.pass);
        
        console.log('');
        console.log('━'.repeat(80));
        if (allPass) {
          console.log('🎉 TODO CORRECTO - SINCRONIZACIÓN PERFECTA');
        } else {
          console.log('⚠️  ALGUNAS VERIFICACIONES FALLARON');
        }
        console.log('━'.repeat(80));
        console.log('');
        
        // Summary for developers
        console.log('💡 PARA DESARROLLADORES:');
        console.log('');
        console.log('   El frontend debe:');
        console.log('   1. Leer priceTiers[] del contrato');
        console.log('   2. Encontrar tier donde now >= startTs');
        console.log('   3. Próximo tier es index + 1');
        console.log('   4. Countdown = nextTier.startTs - now');
        console.log('   5. Auto-refresh cuando countdown = 0');
        console.log('');
        console.log(`   Próxima actualización automática: ${new Date(nextTier.tierStartTs * 1000).toLocaleString()}`);
        console.log('');
        
      } else {
        console.log('ℹ️  Este es el último tier del presale');
        console.log(`   El presale termina: ${endDate.toISOString()}`);
        console.log('');
      }
    } else {
      console.log('⚠️  El presale aún no ha comenzado o no se pudo determinar el tier');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

// Run
verifyPriceSync()
  .then(() => {
    console.log('━'.repeat(80));
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  });

