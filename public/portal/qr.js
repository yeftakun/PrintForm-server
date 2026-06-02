(() => {
  const VERSION_INFO = [
    null,
    { dataCodewords: 19, eccCodewords: 7 },
    { dataCodewords: 34, eccCodewords: 10 },
    { dataCodewords: 55, eccCodewords: 15 },
    { dataCodewords: 80, eccCodewords: 20 },
    { dataCodewords: 108, eccCodewords: 26 }
  ];
  const ALIGNMENT_POSITIONS = {
    1: [],
    2: [6, 18],
    3: [6, 22],
    4: [6, 26],
    5: [6, 30]
  };

  function gfMultiply(a, b) {
    let result = 0;
    for (let i = 0; i < 8; i += 1) {
      if ((b & 1) !== 0) {
        result ^= a;
      }
      const carry = (a & 0x80) !== 0;
      a = (a << 1) & 0xff;
      if (carry) {
        a ^= 0x1d;
      }
      b >>>= 1;
    }
    return result;
  }

  function reedSolomonDivisor(degree) {
    const result = Array(degree).fill(0);
    result[degree - 1] = 1;
    let root = 1;

    for (let i = 0; i < degree; i += 1) {
      for (let j = 0; j < degree; j += 1) {
        result[j] = gfMultiply(result[j], root);
        if (j + 1 < degree) {
          result[j] ^= result[j + 1];
        }
      }
      root = gfMultiply(root, 2);
    }

    return result;
  }

  function reedSolomonRemainder(data, divisor) {
    const result = Array(divisor.length).fill(0);
    data.forEach(byte => {
      const factor = byte ^ result.shift();
      result.push(0);
      divisor.forEach((coefficient, index) => {
        result[index] ^= gfMultiply(coefficient, factor);
      });
    });
    return result;
  }

  function appendBits(bits, value, length) {
    for (let i = length - 1; i >= 0; i -= 1) {
      bits.push((value >>> i) & 1);
    }
  }

  function encodeText(text, versionInfo) {
    const bytes = Array.from(new TextEncoder().encode(text));
    const bits = [];
    appendBits(bits, 0x4, 4);
    appendBits(bits, bytes.length, 8);
    bytes.forEach(byte => appendBits(bits, byte, 8));

    const capacityBits = versionInfo.dataCodewords * 8;
    appendBits(bits, 0, Math.min(4, capacityBits - bits.length));
    while (bits.length % 8 !== 0) {
      bits.push(0);
    }

    const data = [];
    for (let i = 0; i < bits.length; i += 8) {
      data.push(bits.slice(i, i + 8).reduce((value, bit) => (value << 1) | bit, 0));
    }

    const padBytes = [0xec, 0x11];
    for (let i = 0; data.length < versionInfo.dataCodewords; i += 1) {
      data.push(padBytes[i % 2]);
    }

    return data;
  }

  function chooseVersion(text) {
    const byteLength = new TextEncoder().encode(text).length;
    for (let version = 1; version < VERSION_INFO.length; version += 1) {
      const capacityBytes = VERSION_INFO[version].dataCodewords - 2;
      if (byteLength <= capacityBytes) {
        return version;
      }
    }
    throw new Error("Teks QR terlalu panjang untuk generator lokal.");
  }

  function createMatrix(size) {
    return Array.from({ length: size }, () => Array(size).fill(null));
  }

  function createFunctionMatrix(size) {
    return Array.from({ length: size }, () => Array(size).fill(false));
  }

  function setModule(matrix, reserved, x, y, isDark, isFunction = true) {
    if (x < 0 || y < 0 || y >= matrix.length || x >= matrix.length) {
      return;
    }
    matrix[y][x] = Boolean(isDark);
    if (isFunction) {
      reserved[y][x] = true;
    }
  }

  function drawFinder(matrix, reserved, x, y) {
    for (let dy = -1; dy <= 7; dy += 1) {
      for (let dx = -1; dx <= 7; dx += 1) {
        const xx = x + dx;
        const yy = y + dy;
        const inPattern = dx >= 0 && dx <= 6 && dy >= 0 && dy <= 6;
        const isDark = inPattern && (
          dx === 0 || dx === 6 || dy === 0 || dy === 6 ||
          (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4)
        );
        setModule(matrix, reserved, xx, yy, isDark);
      }
    }
  }

  function drawAlignment(matrix, reserved, centerX, centerY) {
    if (reserved[centerY]?.[centerX]) {
      return;
    }
    for (let dy = -2; dy <= 2; dy += 1) {
      for (let dx = -2; dx <= 2; dx += 1) {
        const distance = Math.max(Math.abs(dx), Math.abs(dy));
        setModule(matrix, reserved, centerX + dx, centerY + dy, distance !== 1);
      }
    }
  }

  function drawFunctionPatterns(matrix, reserved, version) {
    const size = matrix.length;
    drawFinder(matrix, reserved, 0, 0);
    drawFinder(matrix, reserved, size - 7, 0);
    drawFinder(matrix, reserved, 0, size - 7);

    for (let i = 8; i < size - 8; i += 1) {
      setModule(matrix, reserved, i, 6, i % 2 === 0);
      setModule(matrix, reserved, 6, i, i % 2 === 0);
    }

    (ALIGNMENT_POSITIONS[version] || []).forEach(y => {
      (ALIGNMENT_POSITIONS[version] || []).forEach(x => drawAlignment(matrix, reserved, x, y));
    });

    setModule(matrix, reserved, 8, 4 * version + 9, true);
    for (let i = 0; i < 9; i += 1) {
      if (i !== 6) {
        setModule(matrix, reserved, 8, i, false);
        setModule(matrix, reserved, i, 8, false);
      }
    }
    for (let i = 0; i < 8; i += 1) {
      setModule(matrix, reserved, size - 1 - i, 8, false);
      setModule(matrix, reserved, 8, size - 1 - i, false);
    }
  }

  function maskBit(mask, x, y) {
    if (mask === 0) return (x + y) % 2 === 0;
    if (mask === 1) return y % 2 === 0;
    if (mask === 2) return x % 3 === 0;
    if (mask === 3) return (x + y) % 3 === 0;
    if (mask === 4) return (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0;
    if (mask === 5) return ((x * y) % 2) + ((x * y) % 3) === 0;
    if (mask === 6) return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
    return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
  }

  function addData(matrix, reserved, codewords, mask) {
    const bits = [];
    codewords.forEach(byte => appendBits(bits, byte, 8));

    let bitIndex = 0;
    let upward = true;
    for (let right = matrix.length - 1; right >= 1; right -= 2) {
      if (right === 6) {
        right -= 1;
      }
      for (let vert = 0; vert < matrix.length; vert += 1) {
        const y = upward ? matrix.length - 1 - vert : vert;
        for (let dx = 0; dx < 2; dx += 1) {
          const x = right - dx;
          if (reserved[y][x]) {
            continue;
          }
          const bit = bitIndex < bits.length ? bits[bitIndex] === 1 : false;
          matrix[y][x] = bit !== maskBit(mask, x, y);
          bitIndex += 1;
        }
      }
      upward = !upward;
    }
  }

  function getFormatBits(mask) {
    const data = (1 << 3) | mask;
    let remainder = data << 10;
    for (let i = 14; i >= 10; i -= 1) {
      if (((remainder >>> i) & 1) !== 0) {
        remainder ^= 0x537 << (i - 10);
      }
    }
    return ((data << 10) | remainder) ^ 0x5412;
  }

  function drawFormatBits(matrix, mask) {
    const bits = getFormatBits(mask);
    const size = matrix.length;
    const bit = index => ((bits >>> index) & 1) !== 0;

    for (let i = 0; i <= 5; i += 1) matrix[i][8] = bit(i);
    matrix[7][8] = bit(6);
    matrix[8][8] = bit(7);
    matrix[8][7] = bit(8);
    for (let i = 9; i < 15; i += 1) matrix[8][14 - i] = bit(i);

    for (let i = 0; i < 8; i += 1) matrix[8][size - 1 - i] = bit(i);
    for (let i = 8; i < 15; i += 1) matrix[size - 15 + i][8] = bit(i);
    matrix[size - 8][8] = true;
  }

  function calculatePenalty(matrix) {
    const size = matrix.length;
    let penalty = 0;

    for (let y = 0; y < size; y += 1) {
      let runColor = matrix[y][0];
      let runLength = 1;
      for (let x = 1; x < size; x += 1) {
        if (matrix[y][x] === runColor) {
          runLength += 1;
          if (runLength === 5) penalty += 3;
          else if (runLength > 5) penalty += 1;
        } else {
          runColor = matrix[y][x];
          runLength = 1;
        }
      }
    }

    for (let x = 0; x < size; x += 1) {
      let runColor = matrix[0][x];
      let runLength = 1;
      for (let y = 1; y < size; y += 1) {
        if (matrix[y][x] === runColor) {
          runLength += 1;
          if (runLength === 5) penalty += 3;
          else if (runLength > 5) penalty += 1;
        } else {
          runColor = matrix[y][x];
          runLength = 1;
        }
      }
    }

    for (let y = 0; y < size - 1; y += 1) {
      for (let x = 0; x < size - 1; x += 1) {
        const color = matrix[y][x];
        if (color === matrix[y][x + 1] && color === matrix[y + 1][x] && color === matrix[y + 1][x + 1]) {
          penalty += 3;
        }
      }
    }

    const darkCount = matrix.flat().filter(Boolean).length;
    const darkPercent = (darkCount * 100) / (size * size);
    penalty += Math.floor(Math.abs(darkPercent - 50) / 5) * 10;
    return penalty;
  }

  function createMatrixForText(text) {
    const version = chooseVersion(text);
    const info = VERSION_INFO[version];
    const size = 21 + (version - 1) * 4;
    const data = encodeText(text, info);
    const ecc = reedSolomonRemainder(data, reedSolomonDivisor(info.eccCodewords));
    const codewords = [...data, ...ecc];

    let bestMatrix = null;
    let bestPenalty = Infinity;
    for (let mask = 0; mask < 8; mask += 1) {
      const matrix = createMatrix(size);
      const reserved = createFunctionMatrix(size);
      drawFunctionPatterns(matrix, reserved, version);
      addData(matrix, reserved, codewords, mask);
      drawFormatBits(matrix, mask);
      const penalty = calculatePenalty(matrix);
      if (penalty < bestPenalty) {
        bestPenalty = penalty;
        bestMatrix = matrix;
      }
    }
    return bestMatrix;
  }

  function drawMatrixToCanvas(canvas, matrix, options = {}) {
    const quiet = options.quiet ?? 4;
    const pixelSize = options.pixelSize || Math.floor(canvas.width / (matrix.length + quiet * 2));
    const qrSize = (matrix.length + quiet * 2) * pixelSize;
    const ctx = canvas.getContext("2d");
    canvas.width = qrSize;
    canvas.height = qrSize;
    ctx.fillStyle = options.background || "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = options.foreground || "#231006";

    matrix.forEach((row, y) => {
      row.forEach((isDark, x) => {
        if (isDark) {
          ctx.fillRect((x + quiet) * pixelSize, (y + quiet) * pixelSize, pixelSize, pixelSize);
        }
      });
    });
  }

  window.PrintOrderQr = {
    createMatrixForText,
    drawMatrixToCanvas
  };
})();
