import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  try {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0b0f19',
            backgroundImage: 'linear-gradient(135deg, #0b0f19 0%, #1a1f2e 100%)',
          }}
        >
          {/* Logo/Brand */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              marginBottom: '40px',
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                backgroundColor: 'white',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#0b0f19',
                  borderRadius: '8px',
                }}
              />
            </div>
            <div
              style={{
                fontSize: '80px',
                fontWeight: 'bold',
                color: 'white',
                letterSpacing: '-2px',
              }}
            >
              Bridge
            </div>
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: '40px',
              color: 'rgba(255, 255, 255, 0.9)',
              textAlign: 'center',
              maxWidth: '900px',
              lineHeight: 1.4,
              marginBottom: '24px',
            }}
          >
            Conecta empresas con equipos de desarrollo
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: '24px',
              color: 'rgba(255, 255, 255, 0.7)',
              textAlign: 'center',
              maxWidth: '800px',
              lineHeight: 1.5,
            }}
          >
            Plataforma colaborativa para gestionar proyectos, invitar miembros y trabajar eficientemente
          </div>

          {/* Features badges */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginTop: '48px',
            }}
          >
            <div
              style={{
                padding: '12px 24px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                fontSize: '20px',
                color: 'white',
                border: '2px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              🤝 Colaboración
            </div>
            <div
              style={{
                padding: '12px 24px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                fontSize: '20px',
                color: 'white',
                border: '2px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              💼 Proyectos
            </div>
            <div
              style={{
                padding: '12px 24px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                fontSize: '20px',
                color: 'white',
                border: '2px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              👥 Equipos
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`Error generating OG image: ${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
