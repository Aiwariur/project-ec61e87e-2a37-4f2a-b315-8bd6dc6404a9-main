import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'parrot_shop.db');

console.log('🔄 Начинаем миграцию базы данных...');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

try {
  // Проверяем есть ли старые данные
  const oldOrders = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name='orders'
  `).get();

  if (oldOrders) {
    const columns = db.prepare(`PRAGMA table_info(orders)`).all();
    const hasOldStructure = columns.some(col => col.name === 'customer_name');

    if (hasOldStructure) {
      console.log('📦 Найдена старая структура, мигрируем данные...');

      // Создаем временные таблицы
      db.exec(`
        CREATE TABLE IF NOT EXISTS customers_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          phone TEXT NOT NULL,
          email TEXT,
          address TEXT,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS orders_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_number TEXT UNIQUE NOT NULL,
          customer_id INTEGER NOT NULL,
          delivery_method TEXT DEFAULT 'Доставка',
          comment TEXT,
          payment_method TEXT DEFAULT 'Не указан',
          total INTEGER NOT NULL,
          status TEXT DEFAULT 'new',
          created_at INTEGER NOT NULL,
          FOREIGN KEY (customer_id) REFERENCES customers_new(id)
        );

        CREATE TABLE IF NOT EXISTS order_items_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          product_name TEXT NOT NULL,
          quantity INTEGER NOT NULL,
          price INTEGER NOT NULL,
          FOREIGN KEY (order_id) REFERENCES orders_new(id)
        );
      `);

      // Мигрируем данные
      const oldOrdersData = db.prepare('SELECT * FROM orders').all();
      
      console.log(`📝 Найдено ${oldOrdersData.length} заказов для миграции`);

      const insertCustomer = db.prepare(`
        INSERT INTO customers_new (name, phone, email, address, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const insertOrder = db.prepare(`
        INSERT INTO orders_new (id, order_number, customer_id, delivery_method, comment, payment_method, total, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertOrderItem = db.prepare(`
        INSERT INTO order_items_new (order_id, product_id, product_name, quantity, price)
        VALUES (?, ?, ?, ?, ?)
      `);

      const getProduct = db.prepare('SELECT name FROM products WHERE id = ?');

      const migrate = db.transaction(() => {
        const customerMap = new Map();

        for (const order of oldOrdersData) {
          // Создаем или находим клиента
          let customerId;
          if (customerMap.has(order.customer_phone)) {
            customerId = customerMap.get(order.customer_phone);
          } else {
            const address = [order.city, order.address, order.apartment]
              .filter(Boolean)
              .join(', ');

            const result = insertCustomer.run(
              order.customer_name,
              order.customer_phone,
              order.customer_email || null,
              address || null,
              order.created_at,
              order.created_at
            );
            customerId = result.lastInsertRowid;
            customerMap.set(order.customer_phone, customerId);
          }

          // Создаем заказ
          insertOrder.run(
            order.id,
            order.order_number,
            customerId,
            order.delivery_method || 'Доставка',
            order.comment || null,
            order.payment_method || 'Не указан',
            order.total,
            order.status,
            order.created_at
          );

          // Мигрируем товары заказа
          const oldItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
          
          for (const item of oldItems) {
            const product = getProduct.get(item.product_id);
            const productName = product ? product.name : 'Товар';
            
            insertOrderItem.run(
              order.id,
              item.product_id,
              productName,
              item.quantity,
              item.price
            );
          }
        }

        console.log(`✅ Создано ${customerMap.size} клиентов`);
      });

      migrate();

      // Удаляем старые таблицы и переименовываем новые
      db.exec(`
        DROP TABLE IF EXISTS order_items;
        DROP TABLE IF EXISTS orders;
        
        ALTER TABLE customers_new RENAME TO customers;
        ALTER TABLE orders_new RENAME TO orders;
        ALTER TABLE order_items_new RENAME TO order_items;

        CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
        CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
        CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
      `);

      console.log('✅ Миграция завершена успешно!');
    } else {
      console.log('✅ База данных уже в новом формате');
    }
  } else {
    console.log('ℹ️ Таблица заказов не найдена, создаем новую структуру...');
    
    db.exec(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        address TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_number TEXT UNIQUE NOT NULL,
        customer_id INTEGER NOT NULL,
        delivery_method TEXT DEFAULT 'Доставка',
        comment TEXT,
        payment_method TEXT DEFAULT 'Не указан',
        total INTEGER NOT NULL,
        status TEXT DEFAULT 'new',
        created_at INTEGER NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price INTEGER NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id)
      );

      CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
      CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
    `);

    console.log('✅ Новая структура создана');
  }

  // Проверяем результат
  const customersCount = db.prepare('SELECT COUNT(*) as count FROM customers').get();
  const ordersCount = db.prepare('SELECT COUNT(*) as count FROM orders').get();
  const itemsCount = db.prepare('SELECT COUNT(*) as count FROM order_items').get();

  console.log('\n📊 Статистика базы данных:');
  console.log(`   Клиентов: ${customersCount.count}`);
  console.log(`   Заказов: ${ordersCount.count}`);
  console.log(`   Товаров в заказах: ${itemsCount.count}`);
  console.log('\n🎉 Готово! Можно запускать сервер.');

} catch (error) {
  console.error('❌ Ошибка миграции:', error);
  process.exit(1);
} finally {
  db.close();
}
