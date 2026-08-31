const deepFreeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
  }
  return value;
};

export const OPENING_REMINDER = '周一举行升旗仪式，请穿校服；少先队员佩戴红领巾。';
export const OPENING_SCHEDULE = deepFreeze([
  { period: '早上', time: '7:50 - 8:00', activity: '到校 · 做好课前准备' },
  { period: '上午', time: '8:00 - 11:10', activity: '上三节课' },
  { period: '午间', time: '14:40 - 14:50', activity: '返校 · 安静入班' },
  { period: '下午', time: '14:50 - 16:10', activity: '上两节课' }
]);

export const NORMAL_SCHEDULE = deepFreeze([
  { period:'上午', name:'预备', summerAutumn:'8:10', winterSpring:'8:10' },
  { period:'上午', name:'第一节', summerAutumn:'8:20 - 9:00', winterSpring:'8:20 - 9:00' },
  { period:'上午', name:'第二节', summerAutumn:'9:10 - 9:50', winterSpring:'9:10 - 9:50' },
  { period:'上午', name:'大课间', summerAutumn:'9:50 - 10:20', winterSpring:'9:50 - 10:20' },
  { period:'上午', name:'第三节', summerAutumn:'10:20 - 10:55', winterSpring:'10:20 - 10:55' },
  { period:'上午', name:'第四节', summerAutumn:'11:05 - 11:40', winterSpring:'11:05 - 11:40' },
  { period:'下午', name:'预备', summerAutumn:'14:50', winterSpring:'14:20' },
  { period:'下午', name:'第五节', summerAutumn:'15:00 - 15:30', winterSpring:'14:30 - 15:00' },
  { period:'下午', name:'第六节', summerAutumn:'15:40 - 16:10', winterSpring:'15:10 - 15:40' },
  { period:'下午', name:'大课间', summerAutumn:'16:10 - 16:40', winterSpring:'15:40 - 16:10' },
  { period:'延时', name:'第七节', summerAutumn:'16:40 - 17:10', winterSpring:'16:10 - 16:40' },
  { period:'延时', name:'第八节', summerAutumn:'17:20 - 17:50', winterSpring:'16:50 - 17:20' },
  { period:'延时', name:'第九节', summerAutumn:'18:00 - 18:30', winterSpring:'17:30 - 18:00' }
]);

export const COURSE_TABLE = deepFreeze({
  lessons:['第一节','第二节','第三节','第四节','第五节','第六节','延时一','延时二','延时三'],
  weekdays:['星期一','星期二','星期三','星期四','星期五'],
  days:[
    ['语文','数学','道德与法治','阅读','写字','体育与健康','特长','特长','诵读'],
    ['数学','语文','语文','科学','艺术 / 音乐','数学','数学','语文','诵读'],
    ['语文','数学','艺术 / 音乐','口语','体育与健康','科学','语文','数学','诵读'],
    ['数学','语文','语文','体育与健康','道德与法治','艺术 / 美术','数学','语文','诵读'],
    ['语文','数学','语文','艺术 / 美术','体育与健康','班队会 / 心理健康','语文','数学','诵读']
  ]
});

const validDate = (date) => date instanceof Date && Number.isFinite(date.getTime());
const assertDate = (date) => { if (!validDate(date)) throw new TypeError('需要有效日期'); };
export function getScheduleMode(date) {
  assertDate(date);
  return date.getMonth() === 8 ? 'opening' : 'normal';
}
export const getDefaultTab = getScheduleMode;
export function getSeason(date) {
  assertDate(date);
  const month = date.getMonth() + 1;
  return month >= 3 && month <= 10 ? 'summerAutumn' : 'winterSpring';
}
export function getCoursesForDate(date) {
  assertDate(date);
  const day = date.getDay();
  return day >= 1 && day <= 5 ? [...COURSE_TABLE.days[day - 1]] : [];
}

const minutes = (text) => {
  const [hour, minute] = text.trim().split(':').map(Number);
  return hour * 60 + minute;
};
const minuteOfDay = (date) => date.getHours() * 60 + date.getMinutes();
const span = (value) => {
  const bits = value.split(' - ');
  return bits.length === 2 ? bits.map(minutes) : [minutes(value), minutes(value)];
};
const result = (status, next = '') => ({ status, next });

export function getDayProgress(date) {
  assertDate(date);
  if (date.getDay() === 0 || date.getDay() === 6) return result('今天是休息日', '周一见！');
  const now = minuteOfDay(date);
  if (getScheduleMode(date) === 'opening') {
    if (now < 470) return result('课前准备', '7:50 到校');
    if (now < 480) return result('到校准备', '8:00 开始上午课程');
    if (now < 670) return result('上午课程', '11:10 上午课程结束');
    if (now < 880) return result('午间休息', '14:40 返校');
    if (now < 890) return result('返校准备', '14:50 开始下午课程');
    if (now < 970) return result('下午课程', '16:10 放学');
    return result('今日课程已结束', '明天见！');
  }

  const season = getSeason(date);
  const rows = NORMAL_SCHEDULE
    .filter((row) => row.name !== '预备')
    .map((row) => ({ name: row.name, ...Object.fromEntries([['range', span(row[season])]]) }));
  const firstStart = rows[0].range[0];
  if (now < firstStart) return result('课前准备', `${NORMAL_SCHEDULE[0][season]} 预备`);
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    if (now >= row.range[0] && now < row.range[1]) return result(row.name, `${row.range[1] / 60 | 0}:${String(row.range[1] % 60).padStart(2, '0')} 结束`);
    const next = rows[index + 1];
    if (next && now >= row.range[1] && now < next.range[0]) {
      const lunch = row.name === '第四节';
      return result(lunch ? '午间休息' : '课间 / 等待下一项', `${next.range[0] / 60 | 0}:${String(next.range[0] % 60).padStart(2, '0')} ${next.name}`);
    }
  }
  return result('今日课程已结束', '明天见！');
}

export function getTodayReminder(date) {
  assertDate(date);
  const opening = getScheduleMode(date) === 'opening';
  const season = getSeason(date);
  const finalTime = opening ? '16:10' : NORMAL_SCHEDULE.at(-1)[season].split(' - ')[1];
  return {
    arrival: '7:50 - 8:00',
    classTime: opening ? '8:00' : NORMAL_SCHEDULE[0][season],
    dismissal: finalTime,
    special: date.getDay() === 1 ? OPENING_REMINDER.replace(/^周一举行升旗仪式，请/, '升旗仪式：请') : ''
  };
}

const WEATHER = new Map([
  [0, ['☀️','晴']], [1, ['🌤️','多云间晴']], [2, ['⛅','多云']], [3, ['☁️','阴']],
  [45, ['🌫️','雾']], [48, ['🌫️','雾凇']], [51, ['🌦️','小毛毛雨']], [53, ['🌦️','毛毛雨']], [55, ['🌧️','强毛毛雨']],
  [56, ['🌧️','冻毛毛雨']], [57, ['🌧️','强冻毛毛雨']], [61, ['🌦️','小雨']], [63, ['🌧️','中雨']], [65, ['🌧️','大雨']],
  [66, ['🌧️','冻雨']], [67, ['🌧️','强冻雨']], [71, ['🌨️','小雪']], [73, ['🌨️','中雪']], [75, ['❄️','大雪']], [77, ['❄️','雪粒']],
  [80, ['🌦️','小阵雨']], [81, ['🌧️','阵雨']], [82, ['⛈️','强阵雨']], [85, ['🌨️','小阵雪']], [86, ['❄️','强阵雪']],
  [95, ['⛈️','雷暴']], [96, ['⛈️','雷暴伴小冰雹']], [99, ['⛈️','雷暴伴大冰雹']]
]);
export function weatherLabel(code) {
  const [icon, text] = WEATHER.get(code) ?? ['🌤️', '天气变化中'];
  return { icon, text };
}
export function normalizeWeatherPayload(payload) {
  const values = [payload?.current?.temperature_2m, payload?.current?.apparent_temperature, payload?.current?.weather_code, payload?.daily?.temperature_2m_max?.[0], payload?.daily?.temperature_2m_min?.[0]];
  if (!values.every(Number.isFinite)) throw new TypeError('天气数据不完整');
  const [temperature, apparentTemperature, weatherCode, maxTemperature, minTemperature] = values;
  const label = weatherLabel(weatherCode);
  const tomorrowValues = [payload?.daily?.weather_code?.[1], payload?.daily?.temperature_2m_max?.[1], payload?.daily?.temperature_2m_min?.[1]];
  let tomorrow = null;
  if (tomorrowValues.every(Number.isFinite)) {
    const [tomorrowCode, tomorrowMax, tomorrowMin] = tomorrowValues;
    const tomorrowLabel = weatherLabel(tomorrowCode);
    tomorrow = { weatherCode: tomorrowCode, maxTemperature: tomorrowMax, minTemperature: tomorrowMin, icon: tomorrowLabel.icon, description: tomorrowLabel.text };
  }
  return { temperature, apparentTemperature, weatherCode, maxTemperature, minTemperature, icon: label.icon, description: label.text, tomorrow };
}
export function buildWeatherUrl() {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  const config = (typeof window !== 'undefined' && window.BLUEY_WEATHER_CONFIG) ?? { latitude: null, longitude: null, timezone: 'auto' };
  if (!Number.isFinite(config.latitude) || !Number.isFinite(config.longitude)) return '';
  url.search = new URLSearchParams({ latitude:String(config.latitude), longitude:String(config.longitude), current:'temperature_2m,apparent_temperature,weather_code', daily:'weather_code,temperature_2m_max,temperature_2m_min', forecast_days:'2', timezone:config.timezone || 'auto' });
  return url.toString();
}

const byId = (id) => typeof document === 'undefined' ? null : document.getElementById(id);
const setText = (id, value) => { const node = byId(id); if (node) node.textContent = value; };
export function updateClock(date = new Date()) {
  setText('current-date', new Intl.DateTimeFormat('zh-CN', { year:'numeric', month:'long', day:'numeric' }).format(date));
  setText('current-weekday', new Intl.DateTimeFormat('zh-CN', { weekday:'long' }).format(date));
  setText('current-time', new Intl.DateTimeFormat('zh-CN', { hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false }).format(date));
}
export function renderToday(date = new Date()) {
  const courses = getCoursesForDate(date);
  const courseNode = byId('today-courses');
  if (courseNode) {
    courseNode.replaceChildren();
    if (!courses.length) courseNode.textContent = '今天是休息日';
    else courses.forEach((course, index) => {
      const item = document.createElement('li');
      item.textContent = `${COURSE_TABLE.lessons[index]}：${course}`;
      courseNode.append(item);
    });
  }
  const progress = getDayProgress(date);
  setText('progress-title', progress.status);
  setText('progress-detail', progress.status === '今天是休息日' ? '放松一下，准备迎接新的学习日。' : '安排会根据当前时间自动更新。');
  setText('next-item', progress.next);
  const reminder = getTodayReminder(date);
  const reminderList = byId('reminder-list');
  if (reminderList) {
    const items = [
      `到校时间：${reminder.arrival}`,
      `开始上课：${reminder.classTime}`,
      `今日课程结束：${reminder.dismissal}`,
      reminder.special
    ].filter(Boolean);
    reminderList.replaceChildren(...items.map((text) => {
      const item = document.createElement('li');
      item.textContent = text;
      return item;
    }));
  }
  return { courses, progress, reminder };
}
export function selectTab(name, { manual = false } = {}) {
  if (typeof document === 'undefined') return;
  document.querySelectorAll('[role="tab"]').forEach((tab) => {
    const active = tab.dataset.tab === name;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    tab.classList.toggle('active', active);
  });
  document.querySelectorAll('[role="tabpanel"]').forEach((panel) => {
    const active = panel.dataset.panel === name;
    panel.hidden = !active;
    panel.classList.toggle('active', active);
  });
  if (manual) document.documentElement.dataset.manualTab = 'true';
}
let weatherPending = false;
export async function refreshWeather() {
  if (weatherPending || typeof fetch !== 'function') return;
  const weatherUrl = buildWeatherUrl();
  if (!weatherUrl) { setText('weather-status', '请先配置天气位置'); setText('weather-description', '示例页面未绑定地点'); return; }
  weatherPending = true;
  const retry = byId('weather-retry');
  if (retry) { retry.disabled = true; retry.hidden = true; }
  setText('weather-status', '正在查看天气…');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(weatherUrl, { signal: controller.signal });
    if (!response.ok) throw new Error('天气请求失败');
    const data = normalizeWeatherPayload(await response.json());
    setText('weather-status', '实时天气已更新');
    setText('weather-icon', data.icon);
    setText('weather-temperature', `${data.temperature}℃`);
    setText('weather-description', data.description);
    setText('apparent-temperature', `${data.apparentTemperature}℃`);
    setText('high-temperature', `${data.maxTemperature}℃`);
    setText('low-temperature', `${data.minTemperature}℃`);
    if (data.tomorrow) {
      setText('tomorrow-icon', data.tomorrow.icon);
      setText('tomorrow-description', data.tomorrow.description);
      setText('tomorrow-high-low', `${data.tomorrow.maxTemperature}℃ / ${data.tomorrow.minTemperature}℃`);
    } else {
      setText('tomorrow-icon', '—');
      setText('tomorrow-description', '明日预报暂不可用');
      setText('tomorrow-high-low', '稍后再看');
    }
  } catch {
    setText('weather-status', '天气暂不可用');
    setText('weather-description', '请检查网络后重试');
    setText('tomorrow-description', '明日预报暂不可用');
    setText('tomorrow-high-low', '稍后再看');
    if (retry) retry.hidden = false;
  } finally {
    clearTimeout(timeout); weatherPending = false; if (retry) retry.disabled = false;
  }
}
export function initializeDashboard() {
  if (typeof document === 'undefined') return;
  updateClock(); renderToday();
  setInterval(() => { const now = new Date(); updateClock(now); renderToday(now); }, 1000);
  selectTab(getDefaultTab(new Date()));
  document.querySelectorAll('[role="tab"]').forEach((tab) => tab.addEventListener('click', () => selectTab(tab.dataset.tab, { manual:true })));
  byId('weather-retry')?.addEventListener('click', refreshWeather);
  byId('print-button')?.addEventListener('click', () => window.print());
  refreshWeather(); setInterval(refreshWeather, 30 * 60 * 1000);
}
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeDashboard, { once:true });
  else initializeDashboard();
}
