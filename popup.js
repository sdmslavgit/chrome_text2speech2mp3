// Pobierz parametry URL
const urlParams = new URLSearchParams(window.location.search);
const selectedText = urlParams.get('text');
let fileUrl = urlParams.get('file');

if (selectedText) {
    document.getElementById("selectedText").textContent = `Zaznaczony tekst: "${selectedText}"`;
}

// Poprawne dekodowanie URL, aby uniknąć problemów z kodowaniem
if (fileUrl) {
    fileUrl = decodeURIComponent(fileUrl); // Dekodowanie linku, jeśli jest zakodowany

    const audioPlayer = document.getElementById("audioPlayer");
    const downloadLink = document.getElementById("downloadLink");

    // Pobranie pliku MP3 z poprawioną nazwą
    const filename = selectedText 
        ? selectedText.replace(/\s+/g, "_").replace(/[^\w\-]/g, "").substring(0, 50) + ".mp3" 
        : "output.mp3";

    // Aktualizacja przycisku pobierania
    downloadLink.href = "#";
    downloadLink.style.display = "block";

    // Po kliknięciu otwiera się natywne okno zapisu i zamyka pop-up po zapisie
    downloadLink.addEventListener("click", async (event) => {
        event.preventDefault(); // Blokujemy domyślne pobieranie

        try {
            // Pobieramy plik MP3
            const response = await fetch(fileUrl);
            const blob = await response.blob();

            // Użycie natywnego systemowego okna wyboru miejsca zapisu
            if (window.showSaveFilePicker) {
                const options = {
                    suggestedName: filename,
                    types: [
                        {
                            description: "Plik MP3",
                            accept: { "audio/mpeg": [".mp3"] }
                        }
                    ]
                };
                
                // Otwiera systemowe okno wyboru pliku
                const fileHandle = await window.showSaveFilePicker(options);
                const writable = await fileHandle.createWritable();
                await writable.write(blob);
                await writable.close();

                // Po zapisaniu pliku zamykamy okno pop-up
                window.close();
            } else {
                // Dla przeglądarek, które nie obsługują `showSaveFilePicker()`
                const blobUrl = URL.createObjectURL(blob);
                const tempLink = document.createElement("a");
                tempLink.href = blobUrl;
                tempLink.download = filename;
                document.body.appendChild(tempLink);
                tempLink.click();
                document.body.removeChild(tempLink);
                URL.revokeObjectURL(blobUrl);

                // Zamknięcie pop-upa po krótkim opóźnieniu
                setTimeout(() => window.close(), 1000);
            }
        } catch (error) {
            console.error("Błąd podczas zapisywania pliku:", error);
        }
    });

    // Pokazanie playera
    audioPlayer.src = fileUrl;
    audioPlayer.style.display = "block";
    
    setTimeout(() => {
        audioPlayer.play().catch(error => console.error("Błąd odtwarzania MP3:", error));
    }, 500); // Opóźnienie na załadowanie pliku
}
