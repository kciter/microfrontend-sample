import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';
const sharePatch = require('@module-federation/nextjs-mf/patchSharing');

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html>
        {sharePatch()}
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
