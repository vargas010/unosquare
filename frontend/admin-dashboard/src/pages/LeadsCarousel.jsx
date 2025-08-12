import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';

const CustomArrow = ({ direction, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`absolute top-1/2 z-10 transform -translate-y-1/2 
        ${direction === 'left' ? 'left-4' : 'right-4'} 
        bg-gray-500 text-white p-3 rounded-full cursor-pointer shadow-lg hover:shadow-xl transition-all`}
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
        console.log("Leads recibidos:", data);
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
    <div className="mt-10 px-4 max-w-md ml-0 rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4 text-left">Leads Asignados Recientemente</h2>

      {leads.length === 0 ? (
        <p className="text-center text-gray-400">No hay leads asignados este mes.</p>
      ) : (
        <Slider {...settings}>
          {leads.map((lead) => (
            <div key={lead.id} className="px-4">
              <div className="border border-gray-300 rounded-lg p-5 w-full flex flex-col gap-4 hover:shadow-2xl transition-all duration-300">
                <h3 className="text-xl font-semibold text-gray-800">{lead.lead_name}</h3>

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