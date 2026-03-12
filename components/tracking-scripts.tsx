import dbConnect from "@/lib/mongodb";
import Setting from "@/models/Setting";
import Script from "next/script";

export async function TrackingScripts() {
  let setting = null;
  try {
    await dbConnect();
    setting = await Setting.findOne({});
  } catch (e) {
    console.error("Failed to load tracking settings", e);
  }

  if (!setting) return null;

  return (
    <>
      {/* Google Tag Manager - Script */}
      {setting.gtmId && (
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${setting.gtmId}');`}
        </Script>
      )}

      {/* Google Analytics 4 */}
      {setting.ga4MeasurementId && !setting.gtmId && (
        <>
          <Script 
            src={`https://www.googletagmanager.com/gtag/js?id=${setting.ga4MeasurementId}`} 
            strategy="afterInteractive" 
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${setting.ga4MeasurementId}');
            `}
          </Script>
        </>
      )}

      {/* Meta / Facebook Pixel */}
      {setting.facebookPixelId && (
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${setting.facebookPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}

      {/* Microsoft Clarity */}
      {setting.microsoftClarityId && (
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${setting.microsoftClarityId}");
          `}
        </Script>
      )}
    </>
  );
}

export async function TrackingNoscript() {
  let setting = null;
  try {
    await dbConnect();
    setting = await Setting.findOne({});
  } catch (e) {
    console.error("Failed to load tracking noscripts", e);
  }

  if (!setting) return null;

  return (
    <>
      {/* Google Tag Manager (noscript) */}
      {setting.gtmId && (
        <noscript>
          <iframe 
            src={`https://www.googletagmanager.com/ns.html?id=${setting.gtmId}`}
            height="0" 
            width="0" 
            style={{ display: 'none', visibility: 'hidden' }} 
          />
        </noscript>
      )}

      {/* Meta Pixel (noscript) */}
      {setting.facebookPixelId && (
        <noscript>
          <img 
            height="1" 
            width="1" 
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${setting.facebookPixelId}&ev=PageView&noscript=1`}
          />
        </noscript>
      )}
    </>
  );
}
