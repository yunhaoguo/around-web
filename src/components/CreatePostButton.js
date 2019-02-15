import React from 'react';
import { Modal, Button, message } from 'antd';
import { CreatePostForm } from "./CreatePostForm";
import { API_ROOT, AUTH_HEADER, TOKEN_KEY, POS_KEY } from "../constants";


export class CreatePostButton extends React.Component {
    state = {
        visible: false,
        confirmLoading: false,
    }

    showModal = () => {
        this.setState({
            visible: true,
        });
    }

    handleOk = () => {
        this.form.validateFields((err, values) => {
           if (!err) {
               this.setState({
                   confirmLoading: true
               });

               const token = localStorage.getItem(TOKEN_KEY);
               const { lat, lon } = JSON.parse(localStorage.getItem(POS_KEY));
               const formData = new FormData();
               formData.set('lat', lat);
               formData.set('lon', lon);
               formData.set('message', values.message);
               formData.set('image', values.image[0].originFileObj);

               fetch(`${API_ROOT}/post`, {
                   method: 'POST',
                   headers: {
                       Authorization: `${AUTH_HEADER} ${token}`,
                   },
                   body: formData,
               }).then((response) => {
                   if (response.ok) {
                       this.form.resetFields();
                       this.setState({ visible: false, confirmLoading: false });
                       return this.props.loadNearbyPosts();
                   }
                   throw new Error(response.statusText);
               }).then(() => {
                   message.success('Post created successfully!');
               }).catch((e) => {
                   console.log(e);
                   this.setState({ confirmLoading: false });
                   message.error('Failed to create the post.');
               });

           }
        });
    }

    handleCancel = () => {
        console.log('Clicked cancel button');
        this.setState({
            visible: false,
        });
    }

    getFormRef = (formInstance) => {
        this.form = formInstance;
    }

    render() {
        const { visible, confirmLoading } = this.state;
        return (
            <div>
                <Button type="primary" onClick={this.showModal}>
                    Create New Post
                </Button>
                <Modal
                    title="Create New Post"
                    visible={visible}
                    onOk={this.handleOk}
                    okText="Create"
                    confirmLoading={confirmLoading}
                    onCancel={this.handleCancel}
                >
                    <div>
                        <CreatePostForm ref={this.getFormRef}/>
                    </div>
                </Modal>
            </div>
        );
    }
}
