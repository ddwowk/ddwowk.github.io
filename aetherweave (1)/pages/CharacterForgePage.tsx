
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Character, Race, Skill, Item } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';
import * as geminiService from '../services/geminiService';

const CharacterForgePage: React.FC = () => {
  const { saveCharacter, getCharacter, characters, deleteCharacter } = useGame();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [char, setChar] = useState<Character>({
    id: `char-${Date.now()}`,
    name: '',
    race: { id: 'race-1', name: 'Human', description: 'A standard human.' },
    skills: [],
    items: [],
  });

  const [isBalancerOpen, setIsBalancerOpen] = useState(false);
  const [balancerContent, setBalancerContent] = useState({ feedback: '', suggestion: '' });
  const [isBalancing, setIsBalancing] = useState(false);
  const [creationToBalance, setCreationToBalance] = useState<{type: 'skill' | 'item' | 'race', index: number} | null>(null);


  useEffect(() => {
    if (id) {
      const existingChar = getCharacter(id);
      if (existingChar) {
        setChar(existingChar);
      }
    }
  }, [id, getCharacter]);

  const handleSave = () => {
    if (char.name) {
      saveCharacter(char);
      navigate('/character-forge');
      setChar({
        id: `char-${Date.now()}`,
        name: '',
        race: { id: 'race-1', name: 'Human', description: 'A standard human.' },
        skills: [],
        items: [],
      });
    } else {
      alert("Character name is required.");
    }
  };
  
  const handleBalance = async (type: 'race' | 'skill' | 'item', index: number) => {
    let description = '';
    if (type === 'race') {
      description = char.race.description;
    } else if (type === 'skill') {
      description = char.skills[index].description;
    } else { // item
      description = char.items[index].description;
    }

    setCreationToBalance({type, index});
    setIsBalancing(true);
    setIsBalancerOpen(true);
    
    const result = await geminiService.balanceCreation(type, description);
    if (result) {
      setBalancerContent(result);
    } else {
      setBalancerContent({ feedback: 'Failed to get balancing information.', suggestion: '' });
    }
    setIsBalancing(false);
  };
  
  const acceptSuggestion = () => {
      if(!creationToBalance) return;
      const {type, index} = creationToBalance;
      const suggestionText = balancerContent.suggestion;

      setChar(prev => {
          const newChar = {...prev};
          if(type === 'race') newChar.race.description = suggestionText;
          if(type === 'skill') newChar.skills[index].description = suggestionText;
          if(type === 'item') newChar.items[index].description = suggestionText;
          return newChar;
      });
      setIsBalancerOpen(false);
      setCreationToBalance(null);
  }

  const addSkill = () => setChar(prev => ({ ...prev, skills: [...prev.skills, { id: `skill-${Date.now()}`, name: '', description: '' }] }));
  const addItem = () => setChar(prev => ({ ...prev, items: [...prev.items, { id: `item-${Date.now()}`, name: '', description: '' }] }));
  
  const updateSkill = (index: number, field: keyof Skill, value: string) => {
    const newSkills = [...char.skills];
    newSkills[index] = { ...newSkills[index], [field]: value };
    setChar(prev => ({ ...prev, skills: newSkills }));
  };

  const updateItem = (index: number, field: keyof Item, value: string) => {
    const newItems = [...char.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setChar(prev => ({ ...prev, items: newItems }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <Modal isOpen={isBalancerOpen} onClose={() => setIsBalancerOpen(false)} title="AI Balancer Feedback">
          {isBalancing ? <div className="flex justify-center items-center h-40"><Spinner /></div> : (
              <div>
                  <h3 className="font-bold text-lg text-brand-subtle">Feedback:</h3>
                  <p className="mb-4 bg-brand-bg p-2 rounded">{balancerContent.feedback}</p>
                  <h3 className="font-bold text-lg text-brand-subtle">Suggestion:</h3>
                  <p className="mb-6 bg-brand-bg p-2 rounded">{balancerContent.suggestion}</p>
                  <div className="flex justify-end space-x-4">
                      <Button variant="secondary" onClick={() => setIsBalancerOpen(false)}>Keep Original</Button>
                      <Button onClick={acceptSuggestion}>Accept Suggestion</Button>
                  </div>
              </div>
          )}
      </Modal>

      <div className="md:col-span-2">
        <Card>
          <h1 className="text-3xl font-bold text-brand-primary mb-6">{id ? 'Edit Character' : 'Create New Character'}</h1>
          <div className="space-y-6">
            <Input placeholder="Character Name" value={char.name} onChange={e => setChar(prev => ({...prev, name: e.target.value}))} />
            
            <Card className="bg-brand-bg">
              <h2 className="text-xl font-bold text-brand-accent mb-2">Race/Species</h2>
              <Input placeholder="Race Name" value={char.race.name} onChange={e => setChar(prev => ({...prev, race: {...prev.race, name: e.target.value}}))} className="mb-2"/>
              <textarea placeholder="Race Description" value={char.race.description} onChange={e => setChar(prev => ({...prev, race: {...prev.race, description: e.target.value}}))} className="w-full bg-brand-bg border border-brand-subtle/30 rounded-md px-3 py-2 text-brand-text placeholder-brand-subtle focus:outline-none focus:ring-2 focus:ring-brand-accent" rows={3}></textarea>
              <Button variant="secondary" className="mt-2" onClick={() => handleBalance('race', 0)}>Balance with AI</Button>
            </Card>

            <Card className="bg-brand-bg">
                <h2 className="text-xl font-bold text-brand-accent mb-2">Skills</h2>
                {char.skills.map((skill, i) => (
                    <div key={skill.id} className="mb-4 p-2 border-b border-brand-subtle/20">
                        <Input placeholder="Skill Name" value={skill.name} onChange={e => updateSkill(i, 'name', e.target.value)} className="mb-2" />
                        <textarea placeholder="Skill Description" value={skill.description} onChange={e => updateSkill(i, 'description', e.target.value)} className="w-full bg-brand-bg border border-brand-subtle/30 rounded-md px-3 py-2" rows={2}></textarea>
                        <Button variant="secondary" size="sm" className="mt-2" onClick={() => handleBalance('skill', i)}>Balance with AI</Button>
                    </div>
                ))}
                <Button onClick={addSkill}>Add Skill</Button>
            </Card>

            <Card className="bg-brand-bg">
                <h2 className="text-xl font-bold text-brand-accent mb-2">Items</h2>
                {char.items.map((item, i) => (
                    <div key={item.id} className="mb-4 p-2 border-b border-brand-subtle/20">
                        <Input placeholder="Item Name" value={item.name} onChange={e => updateItem(i, 'name', e.target.value)} className="mb-2" />
                        <textarea placeholder="Item Description" value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} className="w-full bg-brand-bg border border-brand-subtle/30 rounded-md px-3 py-2" rows={2}></textarea>
                        <Button variant="secondary" size="sm" className="mt-2" onClick={() => handleBalance('item', i)}>Balance with AI</Button>
                    </div>
                ))}
                <Button onClick={addItem}>Add Item</Button>
            </Card>

            <Button onClick={handleSave} className="w-full text-lg">{id ? "Update Character" : "Save Character"}</Button>
          </div>
        </Card>
      </div>

      <div>
        <Card>
          <h2 className="text-2xl font-bold text-brand-primary mb-4">Saved Characters</h2>
          <div className="space-y-4">
            {characters.length > 0 ? characters.map(c => (
              <div key={c.id} className="bg-brand-bg p-3 rounded-md flex justify-between items-center">
                <span className="font-semibold">{c.name}</span>
                <div className="space-x-2">
                  <Button variant="secondary" size="sm" onClick={() => navigate(`/character-forge/${c.id}`)}>Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => deleteCharacter(c.id)}>Del</Button>
                </div>
              </div>
            )) : <p className="text-brand-subtle">No characters saved yet.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CharacterForgePage;
