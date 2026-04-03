const assert = require('assert');

// 1. Verify Medium Format (54x40)
// Phase One IQ4 150MP sensor is exactly 53.4 x 40.0 mm
// Crop factor relative to FF (36x24 diagonal = 43.267)
const diag_ff = Math.sqrt(36*36 + 24*24);
const diag_645 = Math.sqrt(53.4*53.4 + 40.0*40.0);
console.log('mf_645 crop factor:', (diag_ff / diag_645).toFixed(2)); // Should be ~0.65

// 2. Verify Medium Format (44x33)
// GFX / X2D sensor is 43.8 x 32.9 mm
const diag_mf = Math.sqrt(43.8*43.8 + 32.9*32.9);
console.log('mf crop factor:', (diag_ff / diag_mf).toFixed(2)); // Should be ~0.79

// 3. Verify Medium Format Leica (45x30)
// Leica S3 sensor is 45 x 30 mm
const diag_leica = Math.sqrt(45.0*45.0 + 30.0*30.0);
console.log('mf_leica crop factor:', (diag_ff / diag_leica).toFixed(2)); // Should be ~0.80

// 4. Verify APS-C (Nikon/Sony/Leica/Fuji)
const diag_apscn = Math.sqrt(23.5*23.5 + 15.6*15.6);
console.log('apsc_n crop factor:', (diag_ff / diag_apscn).toFixed(2)); // Should be ~1.53

// 5. Verify Smartphone Flagship (1/1.3")
// 1/1.3" sensors (like ISOCELL HP2 in S23 Ultra) are roughly 9.8 x 7.3 mm
const diag_phone = Math.sqrt(9.8*9.8 + 7.3*7.3);
console.log('phone crop factor:', (diag_ff / diag_phone).toFixed(2)); // Should be ~3.54
