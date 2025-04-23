import { NextResponse } from 'next/server';
import pool from '../../lib/db';

export async function POST(request: Request) {
  try {
    console.log('开始处理分数保存请求');
    const { name, score } = await request.json();
    console.log('接收到的数据:', { name, score });
    
    // 创建scores表（如果不存在）
    console.log('尝试创建scores表');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS scores (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        score INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('scores表创建/确认成功');

    // 插入新的分数记录
    console.log('尝试插入新的分数记录');
    const result = await pool.query(
      'INSERT INTO scores (name, score) VALUES ($1, $2) RETURNING *',
      [name, score]
    );
    console.log('分数记录插入成功:', result.rows[0]);

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error saving score:', error);
    return NextResponse.json({ error: 'Failed to save score' }, { status: 500 });
  }
}