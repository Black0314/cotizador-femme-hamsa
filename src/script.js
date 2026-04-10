const departmentSelect = document.getElementById("department");
const citySelect = document.getElementById("city");

// Form calculation logic
const form = document.querySelector("form");
const resultDiv = document.querySelector(".result");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  let price = parseFloat(document.getElementById("price").value) || 0;
  const weight = parseFloat(document.getElementById("weight").value) || 0;
  const unidades = parseInt(document.getElementById("unidades").value) || 1;
  const discount = parseFloat(document.getElementById("discount").value) || 0;

  // Aplicar descuento porcentual al precio
  if (discount > 0) {
    price = price - price * (discount / 100);
  }

  // 1. Subprecio con comisión
  // reformulado: valor + 7% y a este valor sumarle el 30%
  let impuesto19 = price > 200 ? price * 0.19 : 0;
  let valorBase = price + impuesto19;
  let valorMas7 = valorBase * 1.07;
  let valorMas30 = valorMas7 * 1.3;

  const subprecioComision = valorMas30 * unidades;

  // 2. Peso en lb
  const pesoLb = weight;

  // 3. Tarifa por lb
  // Será de 3. Si el valor de id=price es mayor a 200 la tarifa por lb sera de 5.
  const tarifaLb = 3;

  // 4. Costo de envío
  // Resultado de id=weight * 3 o por 5 (tarifaLb)
  const costoEnvio = weight * tarifaLb;

  // 5. Seguro
  // Menor o igual a $200 = $7 fijos
  // > 200 y <= 400 = 4.5%
  // > 400 y <= 800 = 5.5%
  // > 800 y <= 1300 = 6.5%
  // > 1300 y <= 2000 = 7.5%
  // > 2000 = 11%
  let seguro = 0;
  if (price <= 200) {
    seguro = 7;
  } else if (price <= 400) {
    seguro = price * 0.045;
  } else if (price <= 800) {
    seguro = price * 0.055;
  } else if (price <= 1300) {
    seguro = price * 0.065;
  } else if (price <= 2000) {
    seguro = price * 0.075;
  } else {
    seguro = price * 0.11;
  }

  // 6. Gestión Internacional
  const gestionInternacional = 3;

  // 7. Total (sumando costo de envío + seguro + gestión) - Menos subprecio de comisión
  const total = costoEnvio + seguro + gestionInternacional;

  const totalFinal = total + subprecioComision;

  // ============================================================================
  // API DE CONVERSIÓN DE DIVISAS (USD a COP)
  // API Utilizada: ExchangeRate-API (Versión Gratuita Abierta)
  // URL de la API: https://api.exchangerate-api.com/v4/latest/USD
  // Cómo funciona: Al hacer GET a la URL de arriba, devuelve un objeto JSON con la 
  // base en USD y las tasas de conversión (rates) en otras monedas. 
  // Accedemos a data.rates.COP para obtener el valor del Dólar a Peso Colombiano.
  // ============================================================================
  let totalFinalCOP = 0;
  try {
    const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
    const data = await response.json();
    const tasaDolar = data.rates.COP; // Obtenemos el equivalente de 1 USD en COP
    totalFinalCOP = totalFinal * tasaDolar;
  } catch (error) {
    console.error("Error al obtener la tasa de cambio:", error);
    // Valor de respaldo en caso de que la API falle
    totalFinalCOP = totalFinal * 4000; 
  }

  // Formateador para que los pesos colombianos se vean con puntos separadores
  const formateadorCOP = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0
  });

  // Renderizar la cotización
  resultDiv.innerHTML = `
    <div class="mt-8 lg:mt-0 p-6 bg-white rounded-xl shadow-lg w-full text-gray-800 border border-violet-100 h-full">
      <h3 class="text-2xl font-bold mb-6 text-violet-700 text-center">Resumen de Cotización</h3>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">

         <div class="p-4 bg-violet-50 rounded-lg flex flex-col items-center justify-center text-center shadow-sm">
          <p class="text-[10px] text-gray-500 font-bold uppercase tracking-wide mb-1">Subprecio con descuento</p>
          <p class="text-lg font-bold text-violet-900">$${price.toFixed(2)}</p>
        </div>
        
        <div class="p-4 bg-violet-50 rounded-lg flex flex-col items-center justify-center text-center shadow-sm">
          <p class="text-[10px] text-gray-500 font-bold uppercase tracking-wide mb-1">Subprecio con comisión</p>
          <p class="text-lg font-bold text-violet-900">$${subprecioComision.toFixed(2)}</p>
        </div>

     
        
        <div class="p-4 bg-violet-50 rounded-lg flex flex-col items-center justify-center text-center shadow-sm">
          <p class="text-[10px] text-gray-500 font-bold uppercase tracking-wide mb-1">Peso en lb</p>
          <p class="text-lg font-bold text-violet-900">${pesoLb.toFixed(2)}</p>
        </div>
        
        <div class="p-4 bg-violet-50 rounded-lg flex flex-col items-center justify-center text-center shadow-sm">
          <p class="text-[10px] text-gray-500 font-bold uppercase tracking-wide mb-1">Tarifa por lb</p>
          <p class="text-lg font-bold text-violet-900">$${tarifaLb.toFixed(2)}</p>
        </div>
        
        <div class="p-4 bg-violet-50 rounded-lg flex flex-col items-center justify-center text-center shadow-sm">
          <p class="text-[10px] text-gray-500 font-bold uppercase tracking-wide mb-1">Costo de Envío</p>
          <p class="text-lg font-bold text-violet-900">$${costoEnvio.toFixed(2)}</p>
        </div>
        
        <div class="p-4 bg-violet-50 rounded-lg flex flex-col items-center justify-center text-center shadow-sm">
          <p class="text-[10px] text-gray-500 font-bold uppercase tracking-wide mb-1">Seguro</p>
          <p class="text-lg font-bold text-violet-900">$${seguro.toFixed(2)}</p>
        </div>

        <div class="p-4 bg-violet-50 rounded-lg flex flex-col items-center justify-center text-center shadow-sm">
          <p class="text-[10px] text-gray-500 font-bold uppercase tracking-wide mb-1">Gestión Int.</p>
          <p class="text-lg font-bold text-violet-900">$${gestionInternacional.toFixed(2)}</p>
        </div>

      </div>

      <div class="mt-8 p-6 bg-violet-600 text-white rounded-xl flex flex-col items-center shadow-md">
        <span class="text-xs md:text-sm font-bold uppercase tracking-wider mb-2 text-center border-b border-violet-400 pb-2">Total a Pagar (Envío + Seguro + Gestión)</span>
        <span class="text-4xl font-bold mt-2">Subtotal: $ ${total.toFixed(2)} USD</span>
        <span class="text-4xl font-bold mt-2">$${totalFinal.toFixed(2)} USD</span>
        <span class="text-2xl font-semibold mt-2 text-violet-200">${formateadorCOP.format(totalFinalCOP)} COP</span>
      </div>
    </div>
  `;
});
