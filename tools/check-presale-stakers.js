/**
 * Check Presale Stakers
 * Verifica quién ha optado por staking en el presale
 */

const { Connection, PublicKey } = require('@solana/web3.js');
require('dotenv').config(); // Carga variables del .env

// Lee del .env o usa valores por defecto
const PRESALE_PROGRAM_ID = process.env.PRESALE_V3_PROGRAM_ID || 'HNPuLPxycypT4YtD5vMZPdcrr53MLKAajYrQwNTv4ujH';
const RPC_URL = process.env.RPC_URL || 'https://api.devnet.solana.com';

async function checkPresaleStakers() {
  console.log('━'.repeat(80));
  console.log('🔍 Verificando Stakers en el Programa de PRESALE');
  console.log('━'.repeat(80));
  console.log(`\n📍 Program ID: ${PRESALE_PROGRAM_ID}`);
  console.log(`🌐 Network: Devnet\n`);
  
  try {
    const connection = new Connection(RPC_URL, 'confirmed');
    const programId = new PublicKey(PRESALE_PROGRAM_ID);
    
    console.log('⏳ Consultando todas las cuentas del programa...\n');
    
    // Get all accounts owned by the presale program
    const accounts = await connection.getProgramAccounts(programId);
    
    console.log('━'.repeat(80));
    console.log(`\n✅ Total de cuentas encontradas: ${accounts.length}\n`);
    
    if (accounts.length === 0) {
      console.log('ℹ️  NO HAY CUENTAS TODAVÍA\n');
      return;
    }
    
    // Analizar cada cuenta
    let stakersCount = 0;
    let nonStakersCount = 0;
    let totalStaked = 0;
    let totalUnstaked = 0;
    
    console.log('📊 ANÁLISIS DE CUENTAS:\n');
    
    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i];
      const data = account.account.data;
      
      // BuyerStateV3 debería tener más de 100 bytes
      if (data.length > 100) {
        try {
          // Parsear datos manualmente
          let offset = 8; // Skip discriminator
          
          // Read buyer (32 bytes)
          const buyerBytes = data.slice(offset, offset + 32);
          const buyer = new PublicKey(buyerBytes);
          offset += 32;
          
          offset += 1; // Skip bump
          
          // Read totalPurchasedVibes (8 bytes)
          const totalPurchased = data.readBigUInt64LE(offset);
          offset += 8;
          
          // Skip sol and usdc contributed
          offset += 16;
          
          // Read isStaking (1 byte)
          const isStaking = data.readUInt8(offset) === 1;
          offset += 1;
          
          // Read stakedAmount (8 bytes)
          const stakedAmount = data.readBigUInt64LE(offset);
          offset += 8;
          
          // Read unstakedAmount (8 bytes)
          const unstakedAmount = data.readBigUInt64LE(offset);
          
          // Convert to VIBES (6 decimals for MAINNET, 9 for DEVNET)
          // NOTE: Update this if switching networks!
          const VIBES_DECIMALS = 6; // Mainnet = 6, Devnet = 9
          const totalVibes = Number(totalPurchased) / Math.pow(10, VIBES_DECIMALS);
          const stakedVibes = Number(stakedAmount) / Math.pow(10, VIBES_DECIMALS);
          const unstakedVibes = Number(unstakedAmount) / Math.pow(10, VIBES_DECIMALS);
          
          console.log(`\n━━━━ Cuenta #${i + 1} (BuyerState) ━━━━`);
          console.log(`  📍 Address: ${account.pubkey.toBase58()}`);
          console.log(`  👤 Buyer: ${buyer.toBase58()}`);
          console.log(`  💰 Total Purchased: ${totalVibes.toLocaleString()} VIBES`);
          console.log(`  ${isStaking ? '✅' : '❌'} Staking: ${isStaking ? 'YES' : 'NO'}`);
          console.log(`  🔒 Staked: ${stakedVibes.toLocaleString()} VIBES`);
          console.log(`  🔓 Unstaked: ${unstakedVibes.toLocaleString()} VIBES`);
          console.log(`  🔗 Explorer: https://explorer.solana.com/address/${buyer.toBase58()}?cluster=devnet`);
          
          if (isStaking) stakersCount++;
          else nonStakersCount++;
          
          totalStaked += stakedVibes;
          totalUnstaked += unstakedVibes;
          
        } catch (parseError) {
          console.log(`\nCuenta #${i + 1}:`);
          console.log(`  📍 Address: ${account.pubkey.toBase58()}`);
          console.log(`  📏 Data size: ${data.length} bytes`);
          console.log(`  ⚠️  No se pudo parsear (puede ser PresaleState u otro tipo)`);
        }
      } else {
        console.log(`\nCuenta #${i + 1}:`);
        console.log(`  📍 Address: ${account.pubkey.toBase58()}`);
        console.log(`  📏 Data size: ${data.length} bytes`);
        console.log(`  ℹ️  Probablemente PresaleState u otra cuenta del sistema`);
      }
    }
    
    console.log('\n' + '━'.repeat(80));
    console.log('\n📈 RESUMEN:');
    console.log(`  Total de cuentas: ${accounts.length}`);
    console.log(`  Compradores con staking: ${stakersCount}`);
    console.log(`  Compradores sin staking: ${nonStakersCount}`);
    console.log(`  💰 Total STAKED: ${totalStaked.toLocaleString()} VIBES`);
    console.log(`  🔓 Total UNSTAKED: ${totalUnstaked.toLocaleString()} VIBES`);
    console.log('');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
  
  console.log('━'.repeat(80));
}

// Run
checkPresaleStakers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
