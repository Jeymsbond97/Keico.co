import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { NewsService } from '../src/news/news.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const newsService = app.get(NewsService);

  const sampleNews = [
    {
      title: 'KEICO PLUS, 그린 전환 기술혁신 선도 기업으로 성장',
      content: `한국에너지산업(KEICO PLUS)은 AIㆍBig Data 및 에너지 융합 기술을 통해 그린 전환 기술혁신을 선도하고 있습니다. 
      
4차 산업혁명의 핵심기술을 활용하여 각 기업과 기관, 공공ㆍ지자체의 탄소감축 활동과 관리체계를 확립하는 맞춤형 솔루션을 제공하고 있습니다.

디지털 전환(DX)과 사회적 · 그린 전환(SX-DX)을 함께 완성해 나가며, 에너지효율 제고, 순환 경제 활성화, 그린테크 육성 등을 통해 새로운 기술과 문화 및 가치를 창출하고 있습니다.`,
    },
    {
      title: '탄소중립ㆍESG 경영 선도를 위한 ICBM 기술 활용',
      content: `KEICO PLUS는 IoT, Cloud Computing, Big data, Mobile (ICBM)과 AI를 활용하여 탄소중립과 ESG 기반 사회적 가치를 실현하고 있습니다.

DX 플랫폼 기반 에너지 효율 및 기술 혁신을 통해 기후위기 극복과 새로운 기술과 가치 창조에 기여하고 있습니다.

에너지 최적화를 통한 기후위기 극복과 새로운 기술과 가치 창조에 기여하며, 지속 가능한 미래를 위한 선택을 제공하고 있습니다.`,
    },
    {
      title: '친환경 에너지 혁신으로 미래를 향한 기술 발전',
      content: `KEICO PLUS는 깨끗한 환경과 인간 사회가 조화롭게 발전하는 미래가치를 선도하고 있습니다.

디지털전환(DX)을 가속화하여 에너지효율을 제고하고, 지속가능한 발전(SD)을 위한 인식의 전환과 현실 세계를 최적화하는 데 기여하고 있습니다.

기후테크에 기반 한 디지털 전환(DX)과 사회적 · 그린 전환(SX-DX)을 함께 완성해 나가며, 탄소중립 인식의 전환과 그린 생태계 조성에 기여하고 있습니다.`,
    },
  ];

  try {
    const { newsModel } = newsService as any;
    const existingNews = await newsModel.find();
    
    if (existingNews.length === 0) {
      for (const news of sampleNews) {
        await newsModel.create(news);
      }
      console.log(`${sampleNews.length} sample news articles created successfully!`);
    } else {
      console.log('News already exists, skipping seed');
    }
  } catch (error) {
    console.error('Error creating news:', error);
  }

  await app.close();
}

bootstrap();

