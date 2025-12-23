import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { petService } from '../../services/petService';
import PetCard from './PetCard';
import AddPetModal from './AddPetModal';
import EditPetModal from './EditPetModal';
import PetProfile from './PetProfile';

const PetList = () => {
  const [pets, setPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [editingPet, setEditingPet] = useState(null);

  useEffect(() => {
    loadPets();
  }, []);

  useEffect(() => {
    filterPets();
  }, [pets, searchTerm, selectedSpecies]);

  const loadPets = async () => {
    try {
      setLoading(true);
      const data = await petService.getAllPets();
      setPets(data);
    } catch (error) {
      console.error('Error loading pets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPets = () => {
    let filtered = [...pets];

    if (searchTerm) {
      filtered = filtered.filter(pet =>
        pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.breed.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSpecies !== 'all') {
      filtered = filtered.filter(pet => pet.species === selectedSpecies);
    }

    setFilteredPets(filtered);
  };

  const handleAddPet = async ({ petData, photoFile }) => {
    try {
      const newPet = await petService.createPet(petData);
      if (photoFile) {
        await petService.uploadPetImage(newPet.id, photoFile);
      }
      const refreshed = await petService.getAllPets();
      setPets(refreshed);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding pet:', error);
    }
  };

  const handleUpdatePet = async (id, { petData, photoFile }) => {
    try {
      await petService.updatePet(id, petData);
      if (photoFile) {
        await petService.uploadPetImage(id, photoFile);
      }
      const refreshed = await petService.getAllPets();
      setPets(refreshed);
      setShowEditModal(false);
      setEditingPet(null);
    } catch (error) {
      console.error('Error updating pet:', error);
    }
  };

  const handleDeletePet = async (id) => {
    if (window.confirm('Are you sure you want to delete this pet?')) {
      try {
        await petService.deletePet(id);
        setPets(pets.filter(p => p.id !== id));
      } catch (error) {
        console.error('Error deleting pet:', error);
      }
    }
  };

  const handleEditClick = (pet) => {
    setEditingPet(pet);
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">My Pets 🐾</h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <Plus size={20} />
            Add Pet
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">

            <input
              type="text"
              placeholder="Search pets... 🔍"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-4 bg-white rounded-[15px] border-2 border-[#FFE4E1] focus:border-purple-500 focus:outline-none transition-colors text-base"
            />
          </div>
          <div className="relative">

            <select
              value={selectedSpecies}
              onChange={(e) => setSelectedSpecies(e.target.value)}
              className="px-6 py-4 bg-white rounded-[15px] border-2 border-[#FFE4E1] focus:border-purple-500 focus:outline-none transition-colors appearance-none cursor-pointer min-w-[180px]"
            >
              <option value="all">All Species 🌟</option>
              <option value="Dog">Dogs 🐶</option>
              <option value="Cat">Cats 🐱</option>
              <option value="Bird">Birds 🐦</option>
              <option value="Rabbit">🐰 Rabbit</option>
              <option value="Other">Other 🐾</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pet Grid */}
      <div className="max-w-7xl mx-auto">
        {filteredPets.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🐾</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No pets found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedSpecies !== 'all'
                ? 'Try adjusting your filters'
                : 'Start by adding your first pet'}
            </p>
            {!searchTerm && selectedSpecies === 'all' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Add Your First Pet
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPets.map((pet) => (
              <PetCard
                key={pet.id}
                pet={pet}
                onSelect={setSelectedPet}
                onEdit={handleEditClick}
                onDelete={handleDeletePet}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddPetModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddPet}
        />
      )}

      {showEditModal && editingPet && (
        <EditPetModal
          isOpen={showEditModal}
          pet={editingPet}
          onClose={() => {
            setShowEditModal(false);
            setEditingPet(null);
          }}
          onUpdate={handleUpdatePet}
        />
      )}

      {selectedPet && (
        <PetProfile
          pet={selectedPet}
          onClose={() => setSelectedPet(null)}
          onUpdate={loadPets}
        />
      )}
    </div>
  );
};

export default PetList;
