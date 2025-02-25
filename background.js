// Tworzenie opcji w menu kontekstowym
chrome.contextMenus.create({
    id: "textToMp3",
    title: "Generuj MP3 z tekstu",
    contexts: ["selection"], // Opcja pojawia się tylko przy zaznaczonym tekście
});

// Obsługa kliknięcia w menu kontekstowym
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "textToMp3") {
        const selectedText = info.selectionText; // Pobierz zaznaczony tekst
        if (selectedText) {
            fetch('http://localhost:5000/generate-mp3', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: selectedText }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === "success") {
                    const fileUrl = `http://localhost:5000/${data.file}`;
                    const popupUrl = `popup.html?text=${encodeURIComponent(selectedText)}&file=${encodeURIComponent(fileUrl)}`;

                    // Otwórz okno popup z odtwarzaczem MP3 i przyciskiem do pobrania
                    chrome.windows.create({
                        url: popupUrl,
                        type: "popup",
                        width: 400,
                        height: 300,
                    });
                } else {
                    console.error("Błąd podczas generowania MP3:", data.message);
                }
            })
            .catch(error => {
                console.error("Błąd:", error);
            });
        }
    }
});
