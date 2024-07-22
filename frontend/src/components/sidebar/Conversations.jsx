import React from 'react'
import Conversation from './Conversation'
import {getRandomEmoji} from '../../utils/emoji'
import useGetConversations from '../../hooks/useGetConversations';

const Conversations = () => {
	const {loading,conversations}=useGetConversations();
	return (
		<div className='flex flex-col overflow-auto'>
            {conversations.map((conversation, idx) => {
                return (
                    <Conversation 
                        key={conversation.id}
                        conversation={conversation}
                        emoji={getRandomEmoji()}
                        lastIdx={idx === conversations.length - 1}
                    />
                );
            })}
            {loading ? <span className='loading loading-spinner mx-auto'></span> : null}
        </div>
	);
};

export default Conversations