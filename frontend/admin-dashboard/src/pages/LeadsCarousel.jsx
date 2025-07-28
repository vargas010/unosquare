import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const CustomArrow = ({ direction, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`absolute top-1/2 z-10 transform -translate-y-1/2 
        ${direction === 'left' ? 'left-2' : 'right-2'} 
        bg-indigo-500 text-white p-2 rounded-full cursor-pointer shadow-md hover:bg-indigo-600`}
    >
      {direction === 'left' ? '<' : '>'}
    </div>
  );
};

const LeadsCarousel = () => {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await fetch('http://localhost:5000/account-leads/recent');
        const data = await res.json();
        console.log("✅ Leads recibidos:", data);
        setLeads(data);
      } catch (err) {
        console.error('Error cargando leads recientes:', err);
      }
    };

    fetchLeads();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    arrows: true,
    nextArrow: <CustomArrow direction="right" />,
    prevArrow: <CustomArrow direction="left" />,
  };

  return (
    <div className="mt-10 px-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-600 mb-6 text-center">Leads asignados recientemente</h2>

      {leads.length === 0 ? (
        <p className="text-center text-gray-500">No hay leads asignados este mes.</p>
      ) : (
        <Slider {...settings}>
          {leads.map((lead) => (
            <div key={lead.id} className="px-4">
              <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 w-full max-w-md mx-auto flex flex-col gap-4 hover:shadow-2xl transition-all duration-300">
                <h3 className="text-2xl font-extrabold text-indigo-700">{lead.lead_name}</h3>

                <div className="text-sm text-gray-500 flex items-center gap-2">
                  📅 <span>Asignado el: {new Date(lead.start_date).toLocaleDateString()}</span>
                </div>

                <div className="text-gray-700 flex items-center gap-2">
                  🏢 <span className="font-semibold">Empresa:</span> {lead.account_name}
                </div>

                <div className="text-gray-700 flex items-center gap-2">
                  📂 <span className="font-semibold">Tipo:</span> {lead.account_type}
                </div>
              </div>
            </div>
          ))}
        </Slider>
      )}
    </div>
  );
};

export default LeadsCarousel;
