# Event Emitter (Hodisa Chiqaruvchi)

> Node.js dagi `EventEmitter` modulining noldan yozilgan oddiy implementatsiyasi. Ilovangizda maxsus hodisalar (events) yaratish va boshqarish imkonini beradi.

## 📖 Tushuntirish

**Event Emitter** — Node.js arxitekturasining asosi. Bir qism kod hodisa chiqaradi (`emit`), boshqa qism uni tinglaydi (`on`). Bu **Observer** dizayn patternining Node.js ko'rinishi.

Bu papkadagi implementatsiya Node.js ning o'z `EventEmitter` moduliga o'xshash API beradi va u qanday ishlashini o'rgatish maqsadida noldan yozilgan.

## 🚀 Ishlatish

```js
const EventEmitter = require("./event");

const emitter = new EventEmitter();

emitter.on("salom", () => {
  console.log("Salom, dunyo!");
});

emitter.emit("salom");
```

## 📁 Fayl tuzilmasi

```
events-module/
├── event.js    — EventEmitter klassining implementatsiyasi
├── index.js    — Foydalanish misollari
└── package.json
```

## API

### `on(event, listener)` / `addListener(event, listener)`

Belgilangan hodisaga tinglovchi qo'shadi.

- `event` (String): Hodisa nomi.
- `listener` (Function): Hodisa sodir bo'lganda chaqiriladigan funksiya.

### `emit(event, [...args])`

Belgilangan hodisani chiqaradi (trigger qiladi).

- `event` (String): Hodisa nomi.
- `args` (Any): Tinglovchilarga uzatiladigan ixtiyoriy argumentlar.

### `off(event, listener)` / `removeListener(event, listener)`

Belgilangan hodisadan tinglovchini o'chiradi.

### `once(event, listener)`

Faqat bir marta ishlaydigan tinglovchi qo'shadi. Hodisa sodir bo'lgandan keyin avtomatik o'chiriladi.

### `removeAllListeners(event)`

Belgilangan hodisaning barcha tinglovchilarini o'chiradi.

### `listeners(event)`

Belgilangan hodisaning tinglovchilar massivini qaytaradi.

### `listenerCount(event)`

Belgilangan hodisadagi tinglovchilar sonini qaytaradi.

### `eventNames()`

Barcha hodisa nomlarini massiv sifatida qaytaradi.

### `setMaxListeners(n)` / `getMaxListeners()`

Bir hodisaga qo'shish mumkin bo'lgan maksimal tinglovchilar sonini o'rnatadi/o'qiydi.

## 🚀 Ishga tushirish

```bash
node index.js
```

## 📚 Bog'liq maqolalar

- [Nodejs nimalardan iborat va qanday qurilgan?](https://habibovulugbek.medium.com/nodejs-nimalardan-iborat-va-qanday-qurilgan-7dbc6f1a041a)

## License

This project is licensed under the MIT License.

```javascript
const EventEmitter = require("./event-emitter");

const emitter = new EventEmitter();

emitter.on("greet", () => {
  console.log("Hello, world!");
});

emitter.emit("greet");
```

## API

### `on(event, listener)`

Adds a listener to the specified event.

- `event` (String): The name of the event.
- `listener` (Function): The callback function to be executed when the event is emitted.

### `addListener(event, listener)`

Alias for `on`.

### `emit(event, [...args])`

Emits the specified event.

- `event` (String): The name of the event.
- `args` (Any): Optional arguments to be passed to the event listeners.

### `off(event, listener)`

Removes a listener from the specified event.

- `event` (String): The name of the event.
- `listener` (Function): The callback function to be removed from the event.

### `once(event, listener)`

Adds a one-time listener to the specified event.

- `event` (String): The name of the event.
- `listener` (Function): The callback function to be executed only once when the event is emitted.

### `removeAllListeners(event)`

Removes all listeners from the specified event.

- `event` (String): The name of the event.

### `removeListener(event, listener)`

Alias for `off`.

## `listeners(event)`

Returns an array of listeners for the specified event.

- `event` (String): The name of the event.

## `listenerCount(event)`

Returns the number of listeners for the specified event.

- `event` (String): The name of the event.

## `eventNames()`

Returns an array of event names.

## `setMaxListeners(n)`

Sets the maximum number of listeners that can be added to an event.

- `n` (Number): The maximum number of listeners.

## `getMaxListeners()`

Returns the maximum number of listeners that can be added to an event.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
