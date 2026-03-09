const e = React.createElement;

function App() {
  return e('div', { style: { maxWidth: 760, margin: '40px auto', padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' } },
    e('h1', { style: { textAlign: 'center' } }, 'React Test Frontend'),
    e('p', { style: { textAlign: 'center' } }, 'The chatbot should appear in the bottom-right when the included script loads.'),
    e('p', null, 'You can customize this page and the script src to point to your hosted chatbot widget file.'),
    e('div', { style: { marginTop: 20 } },
      e('strong', null, 'Integration snippet used:'),
      e('pre', { style: { background: '#f5f5f5', padding: 12, borderRadius: 6 } }, "<script src=\"https://your-domain.com/chatbot-widget.min.js\" data-auto-init></script>")
    )
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(e(App));