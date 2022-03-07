const blockMessage = `ФОРМАТ:
- Час
- Місто, область
- Опис техніки, рухається чи стоїть
- GPS координати (нижче як це зробити)
- ваші контакти для наводки/уточнень

ПРИКЛАД:
8:17
м. Городня, Чернигівська область
В посадці стоять БУКи, не рухаються, повернуті в сторону міста Чернигів
1й - 51.90923162814216, 31.64663725415263
2й - 51.90888217358738, 31.646019721862935
3й - 51.91023752682623, 31.64119240319336
Степан 067 777 77 77`;

const getStatisticsMessage = ({
  totalSessionCount,
  superGroupsCount,
  groupCount,
  privateCount,
  channelCount,
  adminsChatsCount,
  memberChatsCount,
  botRemovedCount,
}) =>
  `
<b>Кількість всіх чатів: ${totalSessionCount}</b> 🎉

<b>Статистика по групам</b>
Супер-груп чатів: ${superGroupsCount} 👨‍👩‍👧‍👦
Груп чатів: ${groupCount} 👩‍👦

Активний адмін: в ${adminsChatsCount} чатах ✅
Вимкнений адмін: в ${memberChatsCount} чатах ⛔️

Бота видалили: із ${botRemovedCount} груп 😢

<b>Інша статистика</b>
Приватних чатів: ${privateCount} 💁‍♂️
Каналів: ${channelCount} 🔔
`.trim();

module.exports = {
  blockMessage,
  getStatisticsMessage,
};
