import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://study_owner:npg_h5o4xcRdLwuv@ep-dark-unit-a4p2zm8i-pooler.us-east-1.aws.neon.tech/study?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('error', (err) => {
  console.error('数据库连接错误:', err);
});

pool.on('connect', () => {
  console.log('数据库连接成功');
});

export default pool;