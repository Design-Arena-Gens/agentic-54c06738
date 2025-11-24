const canvas = document.getElementById("aurora-canvas");
const ctx = canvas.getContext("2d");

const config = {
  stars: 110,
  auroraBands: 4,
  snowflakes: 90,
};

const state = {
  stars: [],
  aurora: [],
  snowflakes: [],
  frame: 0,
};

const random = (min, max) => Math.random() * (max - min) + min;

const resizeCanvas = () => {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
};

const createStars = () => {
  state.stars = Array.from({ length: config.stars }, () => ({
    x: random(0, canvas.clientWidth),
    y: random(0, canvas.clientHeight * 0.5),
    size: random(0.6, 1.4),
    twinkle: random(0.002, 0.008),
    phase: Math.random() * Math.PI * 2,
  }));
};

const createAurora = () => {
  state.aurora = Array.from({ length: config.auroraBands }, (_, band) => {
    const hue = random(160, 190);
    return {
      hue,
      alpha: random(0.18, 0.28),
      points: Array.from({ length: 8 }, (_, pointIndex) => ({
        x: (canvas.clientWidth / 6) * pointIndex + random(-30, 30),
        base: canvas.clientHeight * (0.2 + band * 0.08),
        offset: random(-20, 20),
        speed: random(0.002, 0.006) * (band + 1),
        phase: random(0, Math.PI * 2),
      })),
    };
  });
};

const createSnowflakes = () => {
  state.snowflakes = Array.from({ length: config.snowflakes }, () => ({
    x: random(0, canvas.clientWidth),
    y: random(0, canvas.clientHeight),
    radius: random(0.6, 2.4),
    speed: random(0.4, 1.4),
    drift: random(-0.6, 0.6),
  }));
};

const drawStars = () => {
  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  state.stars.forEach((star) => {
    const twinkle = Math.sin(state.frame * star.twinkle + star.phase) * 0.4 + 0.6;
    ctx.globalAlpha = Math.max(0.3, twinkle);
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
};

const drawAurora = () => {
  state.aurora.forEach((band) => {
    const gradient = ctx.createLinearGradient(0, 0, canvas.clientWidth, 0);
    gradient.addColorStop(0, `hsla(${band.hue}, 100%, 75%, 0)`);
    gradient.addColorStop(0.2, `hsla(${band.hue + 10}, 90%, 68%, ${band.alpha})`);
    gradient.addColorStop(0.8, `hsla(${band.hue - 5}, 95%, 70%, ${band.alpha})`);
    gradient.addColorStop(1, `hsla(${band.hue}, 100%, 75%, 0)`);

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = gradient;
    ctx.beginPath();

    band.points.forEach((point, index) => {
      const wave =
        Math.sin(state.frame * point.speed + point.phase) * 25 + Math.sin(state.frame * 0.006 + index) * 15;
      const y = point.base + point.offset + wave;
      const x = point.x;

      index === 0 ? ctx.moveTo(x, y) : ctx.quadraticCurveTo(x, y, x, y);
    });

    ctx.lineTo(canvas.clientWidth, canvas.clientHeight);
    ctx.lineTo(0, canvas.clientHeight);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });
};

const drawSnow = () => {
  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  state.snowflakes.forEach((flake) => {
    ctx.beginPath();
    ctx.globalAlpha = random(0.4, 0.9);
    ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
    ctx.fill();

    flake.y += flake.speed;
    flake.x += Math.sin(state.frame * 0.01) * flake.drift;

    if (flake.y > canvas.clientHeight) {
      flake.y = -10;
      flake.x = random(0, canvas.clientWidth);
    }
    if (flake.x < -10) flake.x = canvas.clientWidth + 10;
    if (flake.x > canvas.clientWidth + 10) flake.x = -10;
  });
  ctx.restore();
};

const drawForeground = () => {
  const gradient = ctx.createLinearGradient(0, canvas.clientHeight * 0.65, 0, canvas.clientHeight);
  gradient.addColorStop(0, "rgba(6, 18, 35, 0)");
  gradient.addColorStop(1, "rgba(6, 18, 35, 0.95)");

  ctx.save();
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  ctx.restore();
};

const render = () => {
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  drawStars();
  drawAurora();
  drawSnow();
  drawForeground();
  state.frame += 1;
  requestAnimationFrame(render);
};

const init = () => {
  resizeCanvas();
  createStars();
  createAurora();
  createSnowflakes();
  render();
};

const debounce = (fn, delay = 250) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

window.addEventListener("resize", debounce(init, 200));

init();
