#!/usr/bin/env node

/**
 * Firebase Setup Status Checker
 * Monitors: Pods installation, Authentication, and Firestore enablement
 */

const https = require('https');
const {exec} = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_ID = 'cutbook-47881';
const CHECK_INTERVAL = 5000; // Check every 5 seconds

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

let checkCount = 0;

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function printHeader() {
  console.clear();
  log('═════════════════════════════════════════════════════════════', 'cyan');
  log('🔥  FIREBASE SETUP STATUS MONITOR  🔥', 'cyan');
  log('═════════════════════════════════════════════════════════════', 'cyan');
  log(`Project: cutbook-47881`, 'gray');
  log(`Check #${checkCount}`, 'gray');
  log('═════════════════════════════════════════════════════════════', 'cyan');
  console.log();
}

// Check 1: Pod Installation Status
function checkPodsInstalled() {
  return new Promise(resolve => {
    const podfileLockPath = path.join(__dirname, 'ios', 'Podfile.lock');

    // Check if Podfile.lock exists and contains Firebase
    if (fs.existsSync(podfileLockPath)) {
      const podfileLock = fs.readFileSync(podfileLockPath, 'utf8');

      // Check for Firebase pods
      const hasFirebaseCore = podfileLock.includes('Firebase/CoreOnly');
      const hasFirebaseAuth = podfileLock.includes('Firebase/Auth');
      const hasFirebaseFirestore = podfileLock.includes('Firebase/Firestore');

      if (hasFirebaseCore && hasFirebaseAuth && hasFirebaseFirestore) {
        resolve({
          status: 'complete',
          message: '✅ Pods installed - Firebase iOS dependencies ready',
        });
      } else {
        resolve({
          status: 'partial',
          message: '⏳ Pods installing - Firebase dependencies downloading...',
        });
      }
    } else {
      resolve({
        status: 'pending',
        message: '⏳ Pods not started - Waiting for pod install...',
      });
    }
  });
}

// Check 2: Firebase Authentication Status
async function checkAuthenticationEnabled() {
  // We can't directly check Firebase Console, so we check config files
  // and provide instructions

  const googleServicesPath = path.join(__dirname, 'android', 'app', 'google-services.json');
  const googleServiceInfoPath = path.join(__dirname, 'ios', 'CutBook', 'GoogleService-Info.plist');

  if (fs.existsSync(googleServicesPath) && fs.existsSync(googleServiceInfoPath)) {
    return {
      status: 'manual',
      message: '📋 Authentication - MANUAL CHECK REQUIRED',
      instruction:
        'Go to: https://console.firebase.google.com/project/cutbook-47881/authentication',
    };
  } else {
    return {
      status: 'pending',
      message: '❌ Configuration files missing',
    };
  }
}

// Check 3: Firestore Database Status
async function checkFirestoreEnabled() {
  // Similar to auth, this requires manual verification
  return {
    status: 'manual',
    message: '📋 Firestore - MANUAL CHECK REQUIRED',
    instruction: 'Go to: https://console.firebase.google.com/project/cutbook-47881/firestore',
  };
}

async function performChecks() {
  checkCount++;
  printHeader();

  // Check 1: Pods
  const podsStatus = await checkPodsInstalled();
  log('1️⃣  iOS Pod Installation:', 'yellow');
  if (podsStatus.status === 'complete') {
    log(`   ${podsStatus.message}`, 'green');
  } else {
    log(`   ${podsStatus.message}`, 'yellow');
  }
  console.log();

  // Check 2: Authentication
  const authStatus = await checkAuthenticationEnabled();
  log('2️⃣  Firebase Authentication:', 'yellow');
  if (authStatus.status === 'manual') {
    log(`   ${authStatus.message}`, 'cyan');
    log(`   ${authStatus.instruction}`, 'gray');
    log(`   Action: Enable Email/Password provider`, 'gray');
  }
  console.log();

  // Check 3: Firestore
  const firestoreStatus = await checkFirestoreEnabled();
  log('3️⃣  Cloud Firestore Database:', 'yellow');
  if (firestoreStatus.status === 'manual') {
    log(`   ${firestoreStatus.message}`, 'cyan');
    log(`   ${firestoreStatus.instruction}`, 'gray');
    log(`   Action: Create database in asia-south1 (Mumbai)`, 'gray');
  }
  console.log();

  log('─────────────────────────────────────────────────────────────', 'gray');
  console.log();

  // Summary
  const allComplete = podsStatus.status === 'complete';

  if (allComplete) {
    log('🎉 PODS INSTALLATION COMPLETE!', 'green');
    console.log();
    log('✅ Next Steps:', 'green');
    log('   1. Enable Authentication in Firebase Console', 'green');
    log('   2. Enable Firestore in Firebase Console', 'green');
    log('   3. Report back: "Authentication enabled" and "Firestore enabled"', 'green');
    console.log();
    log('Press Ctrl+C to stop monitoring', 'gray');
  } else {
    log('⏳ Waiting for setup to complete...', 'yellow');
    log('   This monitor will keep checking every 5 seconds', 'gray');
    console.log();
  }

  return allComplete;
}

// Main execution
async function main() {
  log('\n🚀 Starting Firebase Setup Monitor...\n', 'cyan');

  // Initial check
  const complete = await performChecks();

  if (!complete) {
    // Continue monitoring
    const interval = setInterval(async () => {
      const isComplete = await performChecks();
      if (isComplete) {
        clearInterval(interval);
      }
    }, CHECK_INTERVAL);
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\n');
  log('👋 Monitoring stopped. Run again anytime with: node check-firebase-setup.js', 'cyan');
  process.exit(0);
});

main().catch(error => {
  log(`\n❌ Error: ${error.message}`, 'red');
  process.exit(1);
});
