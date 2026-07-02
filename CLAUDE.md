# Проект: Личный финансовый трекер (PWA)

## Обзор
PWA-приложение для учёта личных финансов, доступное на iPhone через "Добавить на экран Домой" в Safari. Полностью офлайн, без бэкенда — все данные хранятся локально на устройстве. В будущем (не сейчас) возможен переход на общий бюджет с синхронизацией — учитывать это при проектировании модели данных, но не усложнять MVP.

## Стек
- **Frontend:** React 18 + TypeScript + Vite
- **Хранилище:** Dexie.js (обёртка над IndexedDB) — локально, без сервера
- **Графики:** Recharts
- **Стили:** Tailwind CSS
- **PWA:** vite-plugin-pwa (manifest + service worker, офлайн-кеширование)
- **Деплой:** статический хостинг (Vercel/Netlify), CI не требуется на старте

## Ключевые архитектурные решения
- **Без бэкенда.** Синхронизация между устройствами не нужна на MVP — каждый пользователь (я и девушка) держит свою независимую копию приложения на своём телефоне.
- **Деньги хранятся в копейках (integer), не float.** Конвертация в рубли — только на уровне отображения. Это критично для финансовых расчётов на JS.
- **Валюта:** только RUB, мультивалютность не нужна.
- **Офлайн — обязательное требование**, синхронизация — нет.

## Модель данных (Dexie schema)

```typescript
interface Transaction {
  id?: number;
  type: 'income' | 'expense';
  amountKopecks: number;
  categoryId: number;
  date: string; // ISO 8601
  note?: string;
  recurringRuleId?: number;
  createdAt: string;
}

interface Category {
  id?: number;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
}

interface Budget {
  id?: number;
  categoryId: number;
  limitKopecks: number;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: string;
}

interface SavingsGoal {
  id?: number;
  name: string;
  targetKopecks: number;
  currentKopecks: number;
  targetDate?: string;
  createdAt: string;
}

interface RecurringRule {
  id?: number;
  type: 'income' | 'expense';
  amountKopecks: number;
  categoryId: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  nextDueDate: string;
  active: boolean;
  note?: string;
}
```

## Правила разработки
- Минимальные изменения за раз — не рефакторить несвязанный код без запроса
- Отдельный коммит на каждую логическую единицу работы, не гигантские коммиты
- Если есть развилка в подходе — предложить варианты и спросить, не решать самому
- Перед реализацией новой фичи — сначала план (что и как), потом код
- Денежную логику (баланс, бюджеты, повторяющиеся платежи) — покрывать unit-тестами
- Roadmap и статус фаз — см. PLAN.md, не здесь
