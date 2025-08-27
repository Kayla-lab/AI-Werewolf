import 'dotenv/config';

// 初始化 Langfuse OpenTelemetry (必须在其他导入之前)
import { initializeLangfuse, shutdownLangfuse, langfuse } from '../src/services/langfuse';
initializeLangfuse();

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PlayerServer } from '../src/PlayerServer';
import { ConfigLoader } from '../src/config/PlayerConfig';
import {
  VotingResponseSchema,
  SpeechResponseSchema,
  LastWordsResponseSchema
} from '../src/validation';
import type { 
  StartGameParams, 
  PlayerContext, 
  WitchContext, 
  SeerContext 
} from '../src/types';

// 加载默认配置
const configLoader = new ConfigLoader();
const config = configLoader.getConfig();

// 验证配置
if (!configLoader.validateConfig()) {
  console.error('❌ 配置验证失败，程序退出');
  process.exit(1);
}

const playerServer = new PlayerServer(config);

// 辅助函数：在AI请求后刷新Langfuse数据
async function flushLangfuseData() {
  try {
    if (process.env.LANGFUSE_SECRET_KEY && process.env.LANGFUSE_PUBLIC_KEY) {
      await langfuse.flushAsync();
      if (config.logging.enabled) {
        console.log('📊 Langfuse数据已刷新');
      }
    }
  } catch (error) {
    console.error('❌ Langfuse刷新失败:', error);
  }
}

// 路由处理函数
async function handleStartGame(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('\n=== START GAME REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const params: StartGameParams = req.body;
    await playerServer.startGame(params);
    
    const response = {
      message: 'Game started successfully',
      langfuseEnabled: true
    };
    
    console.log('Response:', JSON.stringify(response, null, 2));
    console.log('=== END START GAME REQUEST ===\n');
    
    res.json(response);
  } catch (error) {
    console.error('Start game error:', error);
    res.status(500).json({ error: 'Failed to start game' });
  }
}

async function handleSpeak(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('\n=== SPEAK REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const context: PlayerContext = req.body;
    const speech = await playerServer.speak(context);
    
    await flushLangfuseData();
    
    const response = SpeechResponseSchema.parse({ speech });
    console.log('Response:', JSON.stringify(response, null, 2));
    console.log('=== END SPEAK REQUEST ===\n');
    
    res.json(response);
  } catch (error) {
    console.error('Speak error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      res.status(400).json({ error: 'Invalid response data', details: error });
    } else {
      res.status(500).json({ error: 'Failed to generate speech' });
    }
  }
}

async function handleVote(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('\n=== VOTE REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const context: PlayerContext = req.body;
    const voteResponse = await playerServer.vote(context);
    
    await flushLangfuseData();
    
    const response = VotingResponseSchema.parse(voteResponse);
    console.log('Response:', JSON.stringify(response, null, 2));
    console.log('=== END VOTE REQUEST ===\n');
    
    res.json(response);
  } catch (error) {
    console.error('Vote error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      res.status(400).json({ error: 'Invalid response data', details: error });
    } else {
      res.status(500).json({ error: 'Failed to generate vote' });
    }
  }
}

async function handleUseAbility(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('\n=== USE ABILITY REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const context: PlayerContext | WitchContext | SeerContext = req.body;
    const result = await playerServer.useAbility(context);
    
    await flushLangfuseData();
    
    console.log('Response:', JSON.stringify(result, null, 2));
    console.log('=== END USE ABILITY REQUEST ===\n');
    
    res.json(result);
  } catch (error) {
    console.error('Use ability error:', error);
    res.status(500).json({ error: 'Failed to use ability' });
  }
}

async function handleLastWords(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('\n=== LAST WORDS REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const lastWords = await playerServer.lastWords();
    
    await flushLangfuseData();
    
    const response = LastWordsResponseSchema.parse({ content: lastWords });
    console.log('Response:', JSON.stringify(response, null, 2));
    console.log('=== END LAST WORDS REQUEST ===\n');
    
    res.json(response);
  } catch (error) {
    console.error('Last words error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      res.status(400).json({ error: 'Invalid response data', details: error });
    } else {
      res.status(500).json({ error: 'Failed to generate last words' });
    }
  }
}

async function handleStatus(req: VercelRequest, res: VercelResponse) {
  try {
    const status = playerServer.getStatus();
    res.json(status);
  } catch (error) {
    console.error('Status error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      res.status(500).json({ error: 'Invalid status data', details: error });
    } else {
      res.status(500).json({ error: 'Failed to get status' });
    }
  }
}

// 主处理器函数
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 启用 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { url } = req;
  
  try {
    if (url === '/api/player/start-game' && req.method === 'POST') {
      return await handleStartGame(req, res);
    } else if (url === '/api/player/speak' && req.method === 'POST') {
      return await handleSpeak(req, res);
    } else if (url === '/api/player/vote' && req.method === 'POST') {
      return await handleVote(req, res);
    } else if (url === '/api/player/use-ability' && req.method === 'POST') {
      return await handleUseAbility(req, res);
    } else if (url === '/api/player/last-words' && req.method === 'POST') {
      return await handleLastWords(req, res);
    } else if (url === '/api/player/status' && req.method === 'POST') {
      return await handleStatus(req, res);
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}