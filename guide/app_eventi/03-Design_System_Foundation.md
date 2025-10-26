## **Color Palette**
### **Primary Colors**
*   **Primary Blue** - `#3b82f6` (Utilizzato per azioni principali, link, stati attivi e come colore del brand)
*   **Primary Blue (Darker)** - `#2563eb` (Utilizzato per lo stato hover/attivo dei componenti primari)

### **Secondary Colors**
*   **Neutral Gray (Text)** - `#4b5563` (Utilizzato per bottoni secondari e testi meno importanti)
*   **Neutral Gray (Borders)** - `#e5e7eb` (Utilizzato per bordi di input, card e divisori)

### **Accent & Functional Colors**
*   **Success Green** - `#10b981` (Utilizzato per conferme, stati "completato", feedback positivi)
*   **Warning Orange** - `#f59e0b` (Utilizzato per avvisi, stati "in attesa", situazioni che richiedono attenzione)
*   **Error Red** - `#ef4444` (Utilizzato per errori, azioni distruttive, feedback negativi)
*   **Info Cyan** - `#06b6d4` (Utilizzato per messaggi informativi e annunci speciali)

### **Background Colors**
*   **Background** - `#f9fafb` (Sfondo principale dell'applicazione per un look "arioso" e pulito)
*   **Surface** - `#ffffff` (Sfondo per componenti come card e modali, per farli risaltare sullo sfondo principale)

## **Typography**
### **Font Family**
*   **Primary Font**: Inter (Per tutti gli elementi dell'interfaccia, garantisce massima leggibilità)
*   **Monospace Font**: Roboto Mono (Per dati tecnici come ID, codici o timestamp)

### **Font Weights & Styles**
*   **Regular**: 400
*   **Medium**: 500
*   **Semibold**: 600
*   **Bold**: 700

### **Text Styles**
#### **Headings**
*   **H1**: 32px/40px, Semibold (600), Inter
    *   Utilizzato per i titoli principali delle pagine (es. "Congresso Cardiologia 2025").
*   **H2**: 24px/32px, Semibold (600), Inter
    *   Utilizzato per i titoli delle sezioni principali all'interno di una pagina.
*   **H3**: 20px/28px, Semibold (600), Inter
    *   Utilizzato per i titoli delle card o sottosezioni.

#### **Body & Special Text**
*   **Body**: 16px/24px, Regular (400), Inter
    *   Testo principale per paragrafi, descrizioni e contenuti.
*   **Small**: 14px/20px, Regular (400), Inter
    *   Per testi secondari, metadati e descrizioni brevi.
*   **Caption**: 12px/16px, Medium (500), Inter, Uppercase, Letter Spacing: 0.5px
    *   Per label, titoli di categoria (es. "PROGRAMMA" nella dashboard).
*   **Button Text**: 14px/20px, Medium (500), Inter
    *   Testo standard per tutti i bottoni.

## **Component Styling**
### **Buttons**
*   **Primary**
    *   Background: `Primary Blue (#3b82f6)`
    *   Text: `White (#ffffff)`
    *   Height: 44px
    *   Corner Radius: 10px
    *   State (Hover/Active): Background `Primary Blue (Darker) (#2563eb)`
*   **Secondary**
    *   Background: `Surface (#ffffff)`
    *   Text: `Neutral Gray (Text) (#4b5563)`
    *   Border: 1px solid `Neutral Gray (Borders) (#e5e7eb)`
    *   Height: 44px
    *   Corner Radius: 10px
    *   State (Hover/Active): Background `Background (#f9fafb)`
*   **Danger**
    *   Background: `Error Red (#ef4444)`
    *   Text: `White (#ffffff)`
    *   Height: 44px
    *   Corner Radius: 10px
    *   State (Hover/Active): Background più scuro del rosso di errore (`#dc2626`)

### **Cards**
*   **Standard Card**
    *   Background: `Surface (#ffffff)`
    *   Shadow: `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` (Ombra morbida e pronunciata)
    *   Corner Radius: 16px
    *   Padding: 24px (l)

### **Input Fields**
*   **Text Input**
    *   Height: 44px
    *   Border: 1px solid `Neutral Gray (Borders) (#e5e7eb)`
    *   Active State: Bordo diventa 2px solid `Primary Blue (#3b82f6)`
    *   Background: `Surface (#ffffff)`
    *   Corner Radius: 10px

## **Iconography**
*   **Icon Set**: Lucide Icons
*   **Sizes**:
    *   **Small (16px)**: Per icone inline con il testo.
    *   **Medium (20px)**: Default per bottoni e elementi di navigazione.
    *   **Large (24px)**: Per titoli di sezione.
    *   **X-Large (32px+)**: Per Empty States e illustrazioni.
*   **Coloring**:
    *   **Interactive**: Le icone interattive usano `Neutral Gray (Text)` di default e `Primary Blue` in stato hover/attivo.
    *   **Decorative/Status**: Usano i colori funzionali (Success, Warning, Error) o un grigio più chiaro (`#9ca3af`) se puramente decorative.

## **Spacing & Layout**
*   **Base Unit**: 8px
*   **Spacing Scale**:
    *   **xs (4px)** - Spaziatura minima tra elementi strettamente correlati (es. icona e testo).
    *   **s (8px)** - Spaziatura tra elementi piccoli (es. items in una lista).
    *   **m (16px)** - Spaziatura standard tra elementi dell'interfaccia (es. tra campi di un form).
    *   **l (24px)** - Padding interno delle card e spaziatura tra sezioni principali.
    *   **xl (32px)** - Margini verticali ampi tra grandi blocchi di contenuto per un layout "arioso".

## **Motion & Animation**
*   **Standard Transition**: 150ms, `ease-out`
    *   Per feedback rapidi e funzionali come hover su bottoni e link.
*   **Emphasis Transition**: 250ms, `ease-out`
    *   Per transizioni di pannelli o modali che appaiono/scompaiono.
*   **Microinteractions**: 150ms, `ease-out`
    *   Per feedback immediati su azioni utente (es. click su un checkbox).